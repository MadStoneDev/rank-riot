import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// Handles the link in every auth email. Two shapes reach here:
//   - PKCE:       /auth/confirm?code=<code>        -> exchangeCodeForSession
//   - token_hash: /auth/confirm?token_hash=<h>&type=<t> -> verifyOtp
// Supabase self-hosted may use either depending on flow config, so we accept
// both. The 6-digit code on the sign-in screen is the primary path; this link
// is the fallback, so it must land the user signed in regardless of shape.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Only ever redirect to a relative path (open-redirect guard). Prefer an
  // explicit ?next=, then GoTrue's ?redirect_to= when it's relative, else the
  // post-login landing used elsewhere (F-A02).
  const nextParam = searchParams.get("next");
  const redirectToParam = searchParams.get("redirect_to");
  const candidate = nextParam ?? redirectToParam ?? "/overview";
  const next =
    candidate.startsWith("/") && !candidate.startsWith("//")
      ? candidate
      : "/overview";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirect(next);
    }
  }

  // The link was missing params, or expired/invalid. Send the user back to the
  // auth page with a surfaced reason rather than a 404 /error route (F-R02).
  redirect("/auth?error=email_link_invalid");
}
