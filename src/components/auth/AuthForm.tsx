"use client";

import { useState, useRef, FormEvent } from "react";
import {
  signInWithEmail,
  verifyOtp,
  signInWithGoogle,
} from "@/app/auth/actions";
import OtpInput from "./OtpInput";

type AuthState = "email" | "otp";

export default function AuthForm() {
  const [authState, setAuthState] = useState<AuthState>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle email submission
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const result = await signInWithEmail(formData);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setEmail(result.email || "");
      setAuthState("otp");
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (formData: FormData) => {
    // This is a client-side wrapper for the server action
    await verifyOtp(formData);
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const result = await signInWithGoogle();

    if (result.error) {
      setIsLoading(false);
      setError(result.error);
    } else if (result.url) {
      // Redirect to Google OAuth flow
      window.location.href = result.url;
    }
  };

  return (
    <div className="w-full rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center text-neutral-900 mb-6">
          {authState === "email"
            ? "Sign in to your account"
            : "Enter verification code"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {authState === "email" ? (
          <>
            <form ref={formRef} onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-700 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className={`cursor-pointer w-full bg-neutral-800 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Continue with Email"}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="mt-4 w-full flex items-center justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
            </div>
          </>
        ) : (
          <form ref={formRef} action={handleVerifyOtp}>
            <input type="hidden" name="email" value={email} />

            <div className="mb-6">
              <p className="text-center text-sm text-neutral-600 mb-4">
                We've sent a verification code to <strong>{email}</strong>
              </p>

              <OtpInput />
            </div>

            <button
              type="submit"
              className="w-full bg-neutral-800 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Verify and Sign In
            </button>

            <button
              type="button"
              className="w-full mt-3 text-primary-600 py-2 px-4 rounded-md font-medium hover:underline focus:outline-none"
              onClick={() => setAuthState("email")}
            >
              Back to email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
