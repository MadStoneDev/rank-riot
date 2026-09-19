import { redirect } from "next/navigation";

// Switched over: the redesigned /overview is now the projects home.
export default async function ProjectsPage() {
  redirect("/overview");
}
