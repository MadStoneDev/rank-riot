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

  try {
    const supabase = await createClient();

    // Verify the OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      console.error("Error verifying OTP:", error);
      redirect(`/auth?error=${encodeURIComponent(error.message)}`);
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    redirect("/auth?error=authentication_failed");
  }

  // If we get here, authentication was successful
  // Move the redirect outside the try/catch block
  redirect("/dashboard");
}

// Google OAuth authentication
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    // Get the authorization URL for Google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
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
