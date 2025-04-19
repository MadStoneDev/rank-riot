import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  IconArrowLeft,
  IconSettings,
  IconArticle,
  IconLabel,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconH6,
  IconUpload,
  IconDownload,
} from "@tabler/icons-react";

// Import the client component instead
import ImageListClient from "@/components/projects/ImageListClient";
import HeadingListClient from "@/components/projects/HeadingListClient";
import LinkListClient from "@/components/projects/LinkListClient";
import KeywordListClient from "@/components/projects/KeywordListClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  // Metadata generation code...
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  const projectName = project?.name || "Project";

  return {
    title: `${projectName} | RankRiot`,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; pageId: string }>;
}) {
  const { projectId, pageId } = await params;

  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Get project details
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  // Get page details
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .eq("project_id", projectId)
    .single();

  const { data: outPageLinks } = await supabase
    .from("page_links")
    .select("*")
    .eq("project_id", projectId)
    .eq("source_page_id", pageId);

  const { data: inPageLinks } = await supabase
    .from("page_links")
    .select(
      `
    *,
    pages:source_page_id (
      url
    )
  `,
    )
    .eq("destination_url", page.url);

  if (!project || !page) {
    notFound();
  }

  const { keywords, h1s, h2s, h3s, h4s, h5s, h6s, images } = page;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/projects/${projectId}/pages`}
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700"
        >
          <IconArrowLeft className="h-4 w-4 mr-1" />
          Back to Pages
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-500">{page.title}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Page URL:{" "}
            <a
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-bold"
            >
              {page.url}
            </a>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-medium text-neutral-900">Metadata</h3>
          </div>

          <div className="divide-y divide-neutral-200">
            {/* Title section */}
            <div className={`p-4 flex items-start`}>
              <div
                className={`mt-1 flex-shrink-0 rounded-full p-1 text-primary-500`}
              >
                <IconLabel />
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-neutral-900">Title</h4>
                <p className="mt-1 text-sm text-neutral-500">{page.title}</p>
              </div>
              <div className="ml-3 flex-shrink-0">
                {page.title.length < 35 || page.title.length > 75 ? (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 bg-red-100 rounded-full text-xs font-medium capitalize`}
                  >
                    Critical
                  </span>
                ) : page.title.length < 50 || page.title.length > 60 ? (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 bg-orange-100 rounded-full text-xs font-medium capitalize`}
                  >
                    Could be better
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 bg-primary-100 rounded-full text-xs font-medium capitalize`}
                  >
                    Great
                  </span>
                )}
              </div>
            </div>

            {/* Description section */}
            <div className={`p-4 flex items-start`}>
              <div
                className={`mt-1 flex-shrink-0 rounded-full p-1 text-primary-500`}
              >
                <IconArticle />
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-neutral-900">
                  Description
                </h4>
                <p className="mt-1 text-sm text-neutral-500">
                  {page.meta_description}
                </p>
              </div>
              <div className="ml-3 flex-shrink-0">
                {page.meta_description.length < 135 ||
                page.meta_description.length > 175 ? (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 bg-red-100 rounded-full text-xs font-medium capitalize`}
                  >
                    Critical
                  </span>
                ) : page.title.length < 150 || page.title.length > 160 ? (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 bg-orange-100 rounded-full text-xs font-medium capitalize`}
                  >
                    Could be better
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 bg-primary-100 rounded-full text-xs font-medium capitalize`}
                  >
                    Great
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <KeywordListClient keywords={keywords} />

        <HeadingListClient
          headings={h1s}
          headingType="H1"
          criticalClass={
            h1s.length === 0 || h1s.length > 1 ? "bg-red-100 text-red-600" : ""
          }
          title="H1 Headings"
          icon={<IconH1 />}
        />

        <HeadingListClient
          headings={h2s}
          headingType="H2"
          criticalClass={h2s.length === 0 ? "bg-red-100 text-red-600" : ""}
          title="H2 Headings"
          icon={<IconH2 />}
        />

        <HeadingListClient
          headings={h3s}
          headingType="H3"
          criticalClass={h3s.length === 0 ? "bg-red-100 text-red-600" : ""}
          title="H3 Headings"
          icon={<IconH3 />}
        />

        <HeadingListClient
          headings={h4s}
          headingType="H4"
          criticalClass={
            h4s.length === 0 ? "bg-orange-100 text-orange-600" : ""
          }
          title="H4 Headings"
          icon={<IconH4 />}
        />

        <HeadingListClient
          headings={h5s}
          headingType="H5"
          criticalClass={
            h5s.length === 0 ? "bg-orange-100 text-orange-600" : ""
          }
          title="H5 Headings"
          icon={<IconH2 />}
        />

        <HeadingListClient
          headings={h6s}
          headingType="H6"
          criticalClass={
            h6s.length === 0 ? "bg-orange-100 text-orange-600" : ""
          }
          title="H6 Headings"
          icon={<IconH6 />}
        />

        <LinkListClient
          self={page.url}
          links={outPageLinks || []}
          linkDirection="outbound link"
          title="Outbound Links"
          icon={<IconUpload />}
        />

        <LinkListClient
          self={page.url}
          links={inPageLinks || []}
          linkDirection="inbound link"
          title="Inbound Links"
          icon={<IconDownload />}
        />

        <ImageListClient images={images} />
      </div>
    </div>
  );
}
