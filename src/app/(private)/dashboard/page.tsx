import { redirect } from "next/navigation";

// Switched over to the redesigned home at /overview (2026-09-19). The classic
// dashboard's building blocks remain in components/dashboard/* for reuse; this
// route now just forwards to the new home.
export default async function Dashboard() {
  redirect("/overview");
}
