// app/auth/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign In | RankRiot",
  description:
    "Sign in or create an account to access your RankRiot dashboard and manage your SEO projects.",
};

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">RankRiot</h1>
          <p className="text-neutral-600 mt-2">
            Optimize your website's performance
          </p>
        </div>
        <AuthForm />
        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-secondary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-secondary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
