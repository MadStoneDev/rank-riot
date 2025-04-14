"use client";

import { useState } from "react";
import { IconTrash } from "@tabler/icons-react";
import { deleteProject } from "@/app/dashboard/projects/actions";

interface DeleteProjectButtonProps {
  projectId: string;
}

export default function DeleteProjectButton({
  projectId,
}: DeleteProjectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);

    try {
      await deleteProject(projectId);
      // No need to handle success as the action will redirect
    } catch (error) {
      console.error("Error deleting project:", error);
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center">
        <span className="mr-3 text-sm text-neutral-700">Are you sure?</span>
        <button
          onClick={handleCancelDelete}
          disabled={isLoading}
          className="mr-2 px-3 py-1 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmDelete}
          disabled={isLoading}
          className="px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDeleteClick}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      <IconTrash className="h-4 w-4 mr-2" />
      Delete Project
    </button>
  );
}
