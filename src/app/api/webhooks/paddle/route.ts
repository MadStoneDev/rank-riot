import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { PlanId, PaddleWebhookPayload } from "@/types/subscription";

// Lazily initialized Supabase client for webhook processing
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error("Missing Supabase configuration");
    }

    supabase = createClient(url, key);
  }
  return supabase;
}

// Verify Paddle webhook signature
function verifyPaddleSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("PADDLE_WEBHOOK_SECRET not configured");
    return false;
  }

  try {
    // Paddle signature format: ts=timestamp;h1=hash
    const parts = signature.split(";");
    const timestampPart = parts.find((p) => p.startsWith("ts="));
    const hashPart = parts.find((p) => p.startsWith("h1="));

    if (!timestampPart || !hashPart) return false;

    const timestamp = timestampPart.replace("ts=", "");
    const providedHash = hashPart.replace("h1=", "");

    // Build the signed payload
    const signedPayload = `${timestamp}:${payload}`;

    // Calculate expected hash
    const expectedHash = crypto
      .createHmac("sha256", webhookSecret)
      .update(signedPayload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(providedHash),
      Buffer.from(expectedHash)
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

// Map Paddle price ID to plan tier
function mapPriceIdToPlan(priceId: string): PlanId {
  // Starter price IDs (monthly and yearly)
  const starterMonthly = process.env.NEXT_PUBLIC_PADDLE_STARTER_MONTHLY_PRICE_ID;
  const starterYearly = process.env.NEXT_PUBLIC_PADDLE_STARTER_YEARLY_PRICE_ID;

  // Pro price IDs (monthly and yearly)
  const proMonthly = process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID;
  const proYearly = process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID;

  // Business price IDs (monthly and yearly)
  const businessMonthly = process.env.NEXT_PUBLIC_PADDLE_BUSINESS_MONTHLY_PRICE_ID;
  const businessYearly = process.env.NEXT_PUBLIC_PADDLE_BUSINESS_YEARLY_PRICE_ID;

  if (priceId === starterMonthly || priceId === starterYearly) return "starter";
  if (priceId === proMonthly || priceId === proYearly) return "pro";
  if (priceId === businessMonthly || priceId === businessYearly) return "business";

  // Default to free if unknown
  console.warn(`Unknown price ID: ${priceId}, defaulting to free`);
  return "free";
}

// Handle subscription created/updated
async function handleSubscriptionUpdate(data: PaddleWebhookPayload["data"]) {
  const userId = data.custom_data?.userId;

  if (!userId) {
    console.error("No userId in webhook custom_data");
    return;
  }

  // Get the plan from the first item's price
  const priceId = data.items?.[0]?.price?.id;
  const plan = priceId ? mapPriceIdToPlan(priceId) : "free";

  // Map Paddle status to our status
  let subscriptionStatus: string;
  switch (data.status) {
    case "active":
      subscriptionStatus = "active";
      break;
    case "past_due":
      subscriptionStatus = "past_due";
      break;
    case "paused":
      subscriptionStatus = "paused";
      break;
    case "canceled":
    case "cancelled":
      subscriptionStatus = "canceled";
      break;
    case "trialing":
      subscriptionStatus = "trialing";
      break;
    default:
      subscriptionStatus = "active";
  }

  // Update user profile
  const db = getSupabaseClient();
  const { error } = await db
    .from("profiles")
    .update({
      paddle_customer_id: data.customer_id,
      paddle_subscription_id: data.id,
      subscription_tier: plan,
      subscription_status: subscriptionStatus,
      subscription_period_end: data.current_billing_period?.ends_at || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }

  console.log(
    `Updated subscription for user ${userId}: plan=${plan}, status=${subscriptionStatus}`
  );
}

// Handle subscription canceled
async function handleSubscriptionCanceled(data: PaddleWebhookPayload["data"]) {
  const userId = data.custom_data?.userId;

  if (!userId) {
    // Try to find user by paddle_subscription_id
    const { data: profile } = await getSupabaseClient()
      .from("profiles")
      .select("id")
      .eq("paddle_subscription_id", data.id)
      .single();

    if (!profile) {
      console.error("Could not find user for canceled subscription:", data.id);
      return;
    }

    // Update using found profile ID
    await getSupabaseClient()
      .from("profiles")
      .update({
        subscription_status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    console.log(`Canceled subscription for user ${profile.id}`);
    return;
  }

  // Update user profile
  const { error } = await getSupabaseClient()
    .from("profiles")
    .update({
      subscription_status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update canceled subscription:", error);
    throw error;
  }

  console.log(`Canceled subscription for user ${userId}`);
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("paddle-signature");

    // Verify webhook signature in production
    if (process.env.NODE_ENV === "production") {
      if (!verifyPaddleSignature(body, signature)) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event: PaddleWebhookPayload = JSON.parse(body);
    console.log(`Received Paddle webhook: ${event.event_type}`);

    // Check idempotency - don't process same event twice
    const { data: existingEvent } = await getSupabaseClient()
      .from("paddle_webhooks")
      .select("id")
      .eq("event_id", event.event_id)
      .single();

    if (existingEvent) {
      console.log(`Event ${event.event_id} already processed`);
      return NextResponse.json({ message: "Already processed" });
    }

    // Log the webhook event
    await getSupabaseClient().from("paddle_webhooks").insert({
      event_id: event.event_id,
      event_type: event.event_type,
      payload: event,
    });

    // Process based on event type
    switch (event.event_type) {
      case "subscription.created":
      case "subscription.updated":
      case "subscription.resumed":
        await handleSubscriptionUpdate(event.data);
        break;

      case "subscription.canceled":
        await handleSubscriptionCanceled(event.data);
        break;

      case "subscription.past_due":
        // Update status to past_due
        if (event.data.custom_data?.userId) {
          await getSupabaseClient()
            .from("profiles")
            .update({
              subscription_status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("id", event.data.custom_data.userId);
        }
        break;

      case "subscription.paused":
        // Update status to paused
        if (event.data.custom_data?.userId) {
          await getSupabaseClient()
            .from("profiles")
            .update({
              subscription_status: "paused",
              updated_at: new Date().toISOString(),
            })
            .eq("id", event.data.custom_data.userId);
        }
        break;

      case "transaction.completed":
        // Transaction completed - subscription update will handle tier changes
        console.log("Transaction completed:", event.data.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Paddle may send OPTIONS requests for webhook verification
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
