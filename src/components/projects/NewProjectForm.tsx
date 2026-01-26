"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconInfoCircle } from "@tabler/icons-react";
import { toast } from "sonner";
import { PlanId } from "@/types/subscription";

interface NewProjectFormProps {
  currentPlan?: PlanId;
  projectCount?: number;
  maxProjects?: number;
}

export default function NewProjectForm({
  currentPlan = "free",
  projectCount = 0,
  maxProjects = 2,
}: NewProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectType, setProjectType] = useState<"seo" | "audit">("seo");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    formData.append("project_type", projectType);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a subscription limit error
        if (data.code === "PROJECT_LIMIT_REACHED") {
          setError(data.error);
          toast.error("Project limit reached", {
            description: "Please upgrade your plan to create more projects.",
            action: {
              label: "Upgrade",
              onClick: () => router.push("/dashboard/billing"),
            },
          });
          setIsLoading(false);
          return;
        }
        throw new Error(data.error || "Failed to create project");
      }

      // Redirect to the new project page
      if (data.existing) {
        toast.success("Project updated! Starting new scan...");
      } else {
        toast.success("Project created! Scan started...");
      }

      router.push(`/projects/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setIsLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Project Type Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Project Type *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SEO Project Card */}
          <button
            type="button"
            onClick={() => setProjectType("seo")}
            className={`relative p-5 rounded-lg border-2 transition-all text-left ${
              projectType === "seo"
                ? "border-secondary bg-blue-50"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            {projectType === "seo" && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              SEO Project
            </h3>
            <p className="text-sm text-neutral-600 mb-3">
              Comprehensive website crawl with detailed page analysis
            </p>
            <ul className="text-xs text-neutral-500 space-y-1">
              <li>• Full website crawl (100+ pages)</li>
              <li>• Page-by-page SEO analysis</li>
              <li>• Broken link detection</li>
              <li>• Scheduled automatic scans</li>
              <li>• Historical tracking</li>
            </ul>
          </button>

          {/* Audit Project Card */}
          <button
            type="button"
            onClick={() => setProjectType("audit")}
            className={`relative p-5 rounded-lg border-2 transition-all text-left ${
              projectType === "audit"
                ? "border-secondary bg-blue-50"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            {projectType === "audit" && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Audit Project
            </h3>
            <p className="text-sm text-neutral-600 mb-3">
              Quick website analysis with actionable recommendations
            </p>
            <ul className="text-xs text-neutral-500 space-y-1">
              <li>• Fast shallow crawl (~50 pages)</li>
              <li>• Overall quality scores</li>
              <li>• Technology stack detection</li>
              <li>• Performance analysis</li>
              <li>• One-off scans (not automated)</li>
            </ul>
          </button>
        </div>

        {/* Info box about selected type */}
        {projectType === "audit" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start">
            <IconInfoCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Audit projects are designed for quick website assessments. They
              provide overall scores and recommendations without detailed
              page-by-page analysis. Perfect for client pitches or initial
              consultations.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-neutral-700"
          >
            Project Name *
          </label>
          <div className="mt-1">
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder={
                projectType === "seo"
                  ? "My Website SEO"
                  : "Client Audit - Example.com"
              }
              className={`p-3 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md`}
              disabled={isLoading}
            />
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Choose a descriptive name to identify this project.
          </p>
        </div>

        <div className="sm:col-span-6">
          <label
            htmlFor="url"
            className="block text-sm font-medium text-neutral-700"
          >
            Website URL *
          </label>
          <div className="mt-1">
            <input
              id="url"
              name="url"
              type="text"
              placeholder="https://example.com"
              required
              className={`p-3 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md`}
              disabled={isLoading}
            />
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Enter the full URL of the website you want to{" "}
            {projectType === "seo" ? "crawl" : "audit"}. If you don't include
            http:// or https://, we'll add https:// automatically.
          </p>
        </div>

        <div className="sm:col-span-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-neutral-700"
          >
            Project Description (optional)
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Brief description of your project..."
              className={`p-3 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md`}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Only show scan frequency for SEO projects */}
        {projectType === "seo" && (
          <div className="sm:col-span-3">
            <label
              htmlFor="scan_frequency"
              className="block text-sm font-medium text-neutral-700"
            >
              Scan Frequency
            </label>
            <div className="mt-1">
              <select
                id="scan_frequency"
                name="scan_frequency"
                className={`p-3 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-neutral-300 rounded-md`}
                disabled={isLoading}
                defaultValue="weekly"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              How often would you like us to scan your website automatically.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-5 border-t border-neutral-200 flex justify-end space-x-3">
        <Link
          href={"/projects"}
          className="px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading
            ? "Creating..."
            : `Create ${projectType === "seo" ? "SEO" : "Audit"} Project`}
        </button>
      </div>
    </form>
  );
}
