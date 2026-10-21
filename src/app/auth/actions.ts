"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

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
        // Make sure to set the OTP email template in Supabase dashboard
        // with a template that includes {{ .Token }} as the OTP code
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

    // Verify the OTP
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      console.error("Error verifying OTP:", error);
      errorMessage = error.message;
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
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "https://rankriot.app"}/api/auth/callback`,
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
