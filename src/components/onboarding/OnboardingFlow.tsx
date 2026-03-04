"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconChartBar, IconSearch, IconLoader2, IconRocket } from "@tabler/icons-react";
import Modal from "@/components/ui/Modal";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const DISMISS_KEY = "rankriot-onboarding-dismissed";

type Step = "welcome" | "url" | "scanning";

export default function OnboardingFlow() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [step, setStep] = useState<Step>("welcome");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  const handleScan = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    try {
      new URL(normalized);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setStep("scanning");
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      const name = new URL(normalized).hostname.replace("www.", "");
      const { data: project, error } = await supabase
        .from("projects")
        .insert({ name, url: normalized, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem(DISMISS_KEY, "true");
      toast.success(`Project "${name}" created!`);
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create project");
      setStep("url");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleDismiss}
      title=""
      maxWidth="max-w-lg"
    >
      <div className="p-6">
        {step === "welcome" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <IconChartBar className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">
              Welcome to RankRiot!
            </h2>
            <p className="text-neutral-500 text-sm max-w-sm mx-auto">
              Your all-in-one SEO audit platform. Let&apos;s set up your first project
              by scanning a website.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={() => setStep("url")}
                className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <IconRocket className="w-4 h-4" />
                Get Started
              </button>
            </div>
          </div>
        )}

        {step === "url" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-900">
              Enter your website URL
            </h2>
            <p className="text-sm text-neutral-500">
              We&apos;ll create a project and get ready to scan it.
            </p>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                placeholder="example.com"
                autoFocus
                className="w-full pl-10 pr-4 py-3 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setStep("welcome")}
                className="px-4 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleScan}
                disabled={!url.trim()}
                className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        )}

        {step === "scanning" && (
          <div className="text-center space-y-4 py-4">
            <IconLoader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-neutral-900">
              Creating your project...
            </h2>
            <p className="text-sm text-neutral-500">
              Setting things up. You&apos;ll be redirected shortly.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
