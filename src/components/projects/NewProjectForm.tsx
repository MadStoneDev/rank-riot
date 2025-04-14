"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProjectForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      // Redirect to the new project page
      router.push(`/dashboard/projects/${data.id}`);
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
              placeholder="My Website"
              className={`p-2 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md`}
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
              className={`p-2 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md`}
              disabled={isLoading}
            />
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Enter the full URL of the website you want to analyze. If you don't
            include http:// or https://, we'll add https:// automatically.
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
              className={`p-2 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md`}
              disabled={isLoading}
            />
          </div>
        </div>

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
              className={`p-2 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md`}
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
      </div>

      <div className="mt-8 pt-5 border-t border-neutral-200 flex justify-end space-x-3">
        <Link
          href={"/dashboard/projects"}
          className="px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Project"}
        </button>
      </div>
    </form>
  );
}
