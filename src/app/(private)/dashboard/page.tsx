import { redirect } from "next/navigation";

// Switched over to the redesigned home at /overview (2026-09-19); this route
// now just forwards there.
export default async function Dashboard() {
  redirect("/overview");
}
