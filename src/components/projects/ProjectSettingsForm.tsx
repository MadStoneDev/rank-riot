"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProject, deleteProject } from "@/app/(private)/projects/actions";
import { toast } from "sonner";

import { Database } from "../../../database.types";
import { ProjectSettings, sanitizeProjectSettings } from "@/lib/project-settings";
import AdvancedSettingsFields from "./AdvancedSettingsFields";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectSettingsFormProps {
  project: Project;
}

export default function ProjectSettingsForm({
  project,
}: ProjectSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "advanced">("general");
  const formRef = useRef<HTMLFormElement>(null);

  // Normalize whatever is stored in the JSONB column into the known shape
  const initialSettings: ProjectSettings | null = sanitizeProjectSettings(
    project.settings,
    project.url,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    formData.append("id", project.id);

    // Manual validation (form is noValidate): required fields live on the
    // general tab, which may be hidden — switch to it so errors are visible
    if (!String(formData.get("name") || "").trim() || !String(formData.get("url") || "").trim()) {
      setActiveTab("general");
      setError("Project name and website URL are required.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await updateProject(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess("Project settings updated successfully");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="px-6 py-6">
        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-score-critical-muted)] border-l-4 border-[var(--color-score-critical)] text-[var(--color-score-critical)] rounded-md">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-[var(--color-score-good)]/10 border-l-4 border-[var(--color-score-good)] text-[var(--color-score-good)] rounded-md">
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}
          {/* General / Advanced tabs — both panels stay mounted so all fields submit */}
          <div className="mb-6 border-b border-[var(--color-border-default)]">
            <nav className="-mb-px flex gap-6" aria-label="Project settings tabs">
              {(
                [
                  { id: "general", label: "General" },
                  { id: "advanced", label: "Advanced" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-secondary text-[var(--color-text-primary)]"
                      : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className={activeTab === "advanced" ? "" : "hidden"}>
            <AdvancedSettingsFields
              initialSettings={initialSettings}
              baseUrl={project.url}
              disabled={isLoading}
            />
          </div>

          <div className={`grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 ${activeTab === "general" ? "" : "hidden"}`}>
            <div className="sm:col-span-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[var(--color-text-secondary)]"
              >
                Project Name *
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={project.name}
                  className={`p-3 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-[var(--color-border-default)] bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] rounded-md`}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="sm:col-span-6">
              <label
                htmlFor="url"
                className="block text-sm font-medium text-[var(--color-text-secondary)]"
              >
                Website URL *
              </label>
              <div className="mt-1">
                <input
                  id="url"
                  name="url"
                  type="text"
                  required
                  defaultValue={project.url}
                  className={`p-3 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-[var(--color-border-default)] bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] rounded-md`}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="sm:col-span-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-[var(--color-text-secondary)]"
              >
                Project Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={project.description || ""}
                  className={`p-3 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-[var(--color-border-default)] bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] rounded-md`}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="scan_frequency"
                className="block text-sm font-medium text-[var(--color-text-secondary)]"
              >
                Scan Frequency
              </label>
              <div className="mt-1">
                <select
                  id="scan_frequency"
                  name="scan_frequency"
                  className={`p-3 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-[var(--color-border-default)] bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] rounded-md`}
                  defaultValue={project.scan_frequency || ""}
                  disabled={isLoading}
                >
                  <option value="manual">Manual only</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-5 border-t border-[var(--color-border-default)]">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-[var(--color-surface-raised)] rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--color-border-default)] bg-[var(--color-surface-elevated)]">
          <h3 className="text-lg font-medium leading-6 text-[var(--color-score-critical)]">
            Danger Zone
          </h3>
        </div>

        <div className="px-6 py-6">
          <div className="border border-[var(--color-score-critical)]/20 rounded-md p-4">
            <h3 className="text-base font-medium text-[var(--color-text-primary)]">
              Delete Project
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              This will remove the project from your dashboard. Crawled data
              is retained for backlink analysis.
            </p>
            <div className="mt-4">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-danger hover:bg-danger-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger"
                >
                  Delete Project
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--color-score-critical)]">
                    Are you sure? This cannot be undone.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="px-3 py-1.5 border border-[var(--color-border-default)] text-sm font-medium rounded-md text-[var(--color-text-secondary)] bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsDeleting(true);
                      const result = await deleteProject(project.id);
                      if (result?.error) {
                        toast.error(result.error);
                        setIsDeleting(false);
                        setShowDeleteConfirm(false);
                      } else {
                        toast.success("Project deleted");
                        router.push("/projects");
                      }
                    }}
                    disabled={isDeleting}
                    className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-danger hover:bg-danger-hover disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
