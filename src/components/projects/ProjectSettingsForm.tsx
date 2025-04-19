"use client";

import { useState, useRef } from "react";
import { updateProject } from "@/app/(private)/projects/actions";

import { Database } from "../../../database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectSettingsFormProps {
  project: Project;
}

export default function ProjectSettingsForm({
  project,
}: ProjectSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    formData.append("id", project.id);

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
        <form ref={formRef} onSubmit={handleSubmit}>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md">
              <p className="text-sm font-medium">{success}</p>
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
                  defaultValue={project.name}
                  className={`p-3 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md`}
                  disabled={isLoading}
                />
              </div>
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
                  required
                  defaultValue={project.url}
                  className={`p-3 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md`}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="sm:col-span-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-neutral-700"
              >
                Project Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={project.description || ""}
                  className={`p-3 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md`}
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
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-neutral-300 rounded-md"
                  defaultValue={project.scan_frequency || ""}
                  disabled={isLoading}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-5 border-t border-neutral-200">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-lg font-medium leading-6 text-neutral-900 text-red-600">
            Danger Zone
          </h3>
        </div>

        <div className="px-6 py-6">
          <div className="border border-red-200 rounded-md p-4">
            <h3 className="text-base font-medium text-neutral-900">
              Delete Project
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Once you delete a project, there is no going back. Please be
              certain.
            </p>
            <div className="mt-4">
              <button
                type="button"
                // onClick={() => handleDeleteProject()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
