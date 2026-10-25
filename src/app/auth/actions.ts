"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

// Types for our responses
type AuthResult = {
  success?: boolean;
  error?: string;
  email?: string;
  url?: string;
};

// Email-based authentication: Step 1 - Send OTP
export async function signInWithEmail(formData: FormData): Promise<AuthResult> {
  try {
    const email = formData.get("email")?.toString();

    if (!email) {
      return { error: "Email is required" };
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: "Invalid email format" };
    }

    const supabase = await createClient();

    // Use Supabase's OTP authentication
    // This will send an email with a numeric OTP code instead of a magic link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        // Pass the app's own URL so the email's confirmation link points at
        // this app's /auth/confirm, not Supabase's fallback SITE_URL (which was
        // the API host). The 6-digit {{ .Token }} in the template is the
        // primary path; this is the fallback link's base.
        emailRedirectTo: `${getSiteUrl()}/auth/confirm`,
      },
    });

    if (error) {
      console.error("Error sending OTP:", error);
      return { error: error.message };
    }

    return {
      success: true,
      email,
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { error: "Failed to send verification code. Please try again." };
  }
}

// Email-based authentication: Step 2 - Verify OTP
export async function verifyOtp(formData: FormData): Promise<void> {
  const email = formData.get("email")?.toString();
  const otp = formData.get("otp")?.toString();

  if (!email || !otp) {
    redirect("/auth?error=missing_fields");
  }

  // Decide the outcome inside the try, then redirect AFTER it (F-A01).
  // redirect() throws NEXT_REDIRECT; calling it inside the try meant the
  // specific "token expired/invalid" redirect at the error branch was caught
  // here and replaced with the generic authentication_failed, so users never
  // saw the real reason. Compute a message, redirect once outside the catch.
  let errorMessage: string | null = null;
  try {
    const supabase = await createClient();

    // A returning user's code verifies as type "email" (signInWithOtp magic
    // link); a brand-new user's code comes from the signup-confirmation email
    // and verifies as type "signup". We don't know which at this point, so try
    // "email" first and fall back to "signup" before surfacing an error — this
    // is what let new users complete sign-in from the same code screen.
    const first = await supabase.auth.verifyOtp({
      email: email!,
      token: otp!,
      type: "email",
    });
    if (first.error) {
      const second = await supabase.auth.verifyOtp({
        email: email!,
        token: otp!,
        type: "signup",
      });
      if (second.error) {
        console.error("Error verifying OTP:", first.error, second.error);
        errorMessage = first.error.message;
      }
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    errorMessage = "authentication_failed";
  }

  if (errorMessage) {
    redirect(`/auth?error=${encodeURIComponent(errorMessage)}`);
  }

  // Authentication succeeded — land on the live projects list, matching the
  // nav's "Projects" destination rather than the classic dashboard (F-A02).
  redirect("/overview");
}

// Google OAuth authentication
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    // Get the authorization URL for Google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getSiteUrl()}/api/auth/callback`,
      },
    });

    if (error) {
      console.error("Error generating Google auth URL:", error);
      return { error: error.message };
    }

    return { success: true, url: data.url };
  } catch (error) {
    console.error("Error initializing Google sign-in:", error);
    return { error: "Failed to initialize Google sign-in. Please try again." };
  }
}
