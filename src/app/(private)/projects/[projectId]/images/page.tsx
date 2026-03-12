import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ImageAuditView from "@/components/projects/ImageAuditView";

export const metadata: Metadata = {
  title: "Image Audit | RankRiot",
};

export default async function ImageAuditPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, url")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  // Get all pages with images (exclude non-HTTP URLs)
  const { data: pagesWithImages } = await supabase
    .from("pages")
    .select("id, url, title, images")
    .eq("project_id", projectId)
    .like("url", "http%")
    .not("images", "is", null);

  // Flatten to per-image rows
  const images = (pagesWithImages || []).flatMap((page: any) =>
    (Array.isArray(page.images) ? page.images : []).map((img: any) => ({
      pageUrl: page.url,
      pageTitle: page.title || "",
      pageId: page.id,
      imageSrc: img.src || "",
      alt: img.alt || "",
      hasAlt: !!(img.alt && img.alt.trim()),
    })),
  );

  return (
    <ImageAuditView
      images={images}
      projectId={projectId}
      projectName={project.name}
    />
  );
}
