import { redirect } from "next/navigation";

// Switched over: the redesigned /overview is now the projects home. The classic
// project list (components/projects/ProjectList and friends) remains for reuse.
export default async function ProjectsPage() {
  redirect("/overview");
}
