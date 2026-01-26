-- RankRiot Subscription System Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Modify profiles table
-- ============================================

-- Rename stripe_customer_id to paddle_customer_id
ALTER TABLE profiles RENAME COLUMN stripe_customer_id TO paddle_customer_id;

-- Add new subscription fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- Set default tier for existing users
UPDATE profiles SET subscription_tier = 'free' WHERE subscription_tier IS NULL;
UPDATE profiles SET subscription_status = 'active' WHERE subscription_status IS NULL;

-- ============================================
-- 2. Create subscription_plans table
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER,
  paddle_price_id_monthly TEXT,
  paddle_price_id_yearly TEXT,
  max_projects INTEGER NOT NULL,
  max_pages_per_scan INTEGER NOT NULL,
  scan_frequency TEXT NOT NULL,
  max_keywords INTEGER NOT NULL,
  history_days INTEGER NOT NULL,
  max_team_members INTEGER NOT NULL,
  max_competitors INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert plan data
INSERT INTO subscription_plans (id, name, price_monthly, price_yearly, max_projects, max_pages_per_scan, scan_frequency, max_keywords, history_days, max_team_members, max_competitors, features) VALUES
  ('free', 'Free', 0, NULL, 2, 250, 'weekly', 25, 14, 1, 1, '{"pdf_reports": false, "on_demand_scans": false}'),
  ('starter', 'Starter', 900, 8400, 5, 2500, 'weekly', 100, 90, 1, 3, '{"pdf_reports": false, "on_demand_scans": false}'),
  ('pro', 'Pro', 2900, 28800, 15, 25000, 'daily', 500, 365, 3, 5, '{"pdf_reports": true, "on_demand_scans": false}'),
  ('business', 'Business', 5900, 58800, -1, 100000, 'daily', 2000, 730, 5, 10, '{"pdf_reports": true, "on_demand_scans": true}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  max_projects = EXCLUDED.max_projects,
  max_pages_per_scan = EXCLUDED.max_pages_per_scan,
  scan_frequency = EXCLUDED.scan_frequency,
  max_keywords = EXCLUDED.max_keywords,
  history_days = EXCLUDED.history_days,
  max_team_members = EXCLUDED.max_team_members,
  max_competitors = EXCLUDED.max_competitors,
  features = EXCLUDED.features;

-- ============================================
-- 3. Create usage_tracking table
-- ============================================

CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  projects_count INTEGER DEFAULT 0,
  scans_performed INTEGER DEFAULT 0,
  pages_scanned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_period ON usage_tracking(user_id, period_start);

-- ============================================
-- 4. Create paddle_webhooks table (audit log)
-- ============================================

CREATE TABLE IF NOT EXISTS paddle_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paddle_webhooks_event_id ON paddle_webhooks(event_id);

-- ============================================
-- 5. Row Level Security Policies
-- ============================================

-- Enable RLS on new tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE paddle_webhooks ENABLE ROW LEVEL SECURITY;

-- subscription_plans: Everyone can read (public pricing info)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (true);

-- usage_tracking: Users can only see their own usage
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- paddle_webhooks: Only service role can access (via API)
-- No policies needed as this is backend-only

-- ============================================
-- 6. Helper function to increment usage
-- ============================================

CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_scans INTEGER DEFAULT 0,
  p_pages INTEGER DEFAULT 0
)
RETURNS void AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  -- Calculate current month period
  v_period_start := date_trunc('month', CURRENT_DATE)::DATE;
  v_period_end := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;

  -- Upsert usage record
  INSERT INTO usage_tracking (user_id, period_start, period_end, scans_performed, pages_scanned)
  VALUES (p_user_id, v_period_start, v_period_end, p_scans, p_pages)
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET
    scans_performed = usage_tracking.scans_performed + p_scans,
    pages_scanned = usage_tracking.pages_scanned + p_pages,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Function to get user's current usage
-- ============================================

CREATE OR REPLACE FUNCTION get_current_usage(p_user_id UUID)
RETURNS TABLE (
  projects_count BIGINT,
  scans_this_month INTEGER,
  pages_this_month INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM projects WHERE user_id = p_user_id) as projects_count,
    COALESCE(ut.scans_performed, 0) as scans_this_month,
    COALESCE(ut.pages_scanned, 0) as pages_this_month
  FROM (SELECT 1) as dummy
  LEFT JOIN usage_tracking ut ON ut.user_id = p_user_id
    AND ut.period_start = date_trunc('month', CURRENT_DATE)::DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
