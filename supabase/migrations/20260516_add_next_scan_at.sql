ALTER TABLE projects ADD COLUMN IF NOT EXISTS next_scan_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_next_scan_at ON projects (next_scan_at) WHERE next_scan_at IS NOT NULL AND deleted_at IS NULL;
