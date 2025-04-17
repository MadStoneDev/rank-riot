import Link from "next/link";
import { redirect } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/server";
import NewProjectForm from "@/components/projects/NewProjectForm";

export const metadata = {
  title: "Create a New Project | RankRiot",
};

export default async function NewProjectPage() {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  console.log(user.email);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href={`/dashboard/projects`}
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
        >
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Create New Project
        </h1>
        <p className="text-neutral-500">
          Set up a new project to start monitoring your website's SEO
          performance.
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-1">
            Project Details
          </h2>
          <p className="text-sm text-neutral-500">
            Fill in the information below to create your new project.
          </p>
        </div>

        <div>
          <NewProjectForm />
        </div>
      </div>
    </div>
  );
}
