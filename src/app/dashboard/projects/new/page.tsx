import Link from "next/link";
import { redirect } from "next/navigation";

import { IconArrowLeft } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/server";

import NewProjectForm from "@/components/projects/NewProjectForm";

export default async function NewProjectPage() {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/projects`}
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700"
        >
          <IconArrowLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Create New Project
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Set up a new project to start monitoring your website's SEO
          performance.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-lg font-medium leading-6 text-neutral-900">
            Project Details
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Fill in the information below to create your new project.
          </p>
        </div>

        <div className="px-6 py-6">
          <NewProjectForm />
        </div>
      </div>
    </div>
  );
}
