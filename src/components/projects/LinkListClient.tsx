"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { IconExternalLink, IconLink, IconPhoto } from "@tabler/icons-react";
import PaginatedList from "@/components/projects/PaginatedListBlock";

import { Database } from "../../../database.types";
import { decode } from "html-entities";

type Link = Database["public"]["Tables"]["page_links"]["Row"] & {
  pages: {
    url: string;
  };
};

export default function LinkListClient({
  self,
  projectId,
  links,
  linkDirection,
  icon,
  title,
}: {
  self?: string;
  projectId: string;
  links: Link[];
  linkDirection?: string;
  icon?: ReactNode;
  title?: string;
}) {
  // Define the render function within the client component
  const renderLinkItem = (link: Link, index: number) => (
    <div key={index} className={`p-4 flex items-start`}>
      <div className={`mt-1 flex-shrink-0 rounded-full p-1 text-primary-500`}>
        {icon ? icon : <IconLink />}
      </div>
      <div className={`ml-3 flex-1`}>
        <div
          className={`flex gap-1 w-full text-sm font-medium text-neutral-900`}
        >
          <h4>Source:</h4>
          {linkDirection === "inbound link" && (
            <div className={`flex flex-wrap justify-start items-center gap-2`}>
              <Link
                href={`/projects/${projectId}/pages/${link.source_page_id}`}
                className={`text-primary-500 hover:text-primary-400 transition-all duration-300 ease-in-out`}
              >
                {link.pages.url}
              </Link>
              {self && self === link.pages.url ? (
                <span className={`font-light`}> (Self)</span>
              ) : (
                ""
              )}
            </div>
          )}
          {/* 9cedd54c-4082-41a9-b40f-209af31bbb35 */}
          {linkDirection === "outbound link" && (
            <p className="flex justify-start items-center gap-2">
              {link.destination_page_id ? (
                <Link
                  href={`/projects/${projectId}/pages/${link.destination_page_id}`}
                  className={`text-primary-500 hover:text-primary-400 transition-all duration-300 ease-in-out`}
                >
                  {link.destination_url}
                </Link>
              ) : (
                link.destination_url
              )}
              {self && self === link.destination_url ? (
                <span className={`font-light`}> (Self)</span>
              ) : (
                ""
              )}
            </p>
          )}
        </div>

        {link.anchor_text && link.anchor_text.length > 0 ? (
          <p className={`mt-1 text-sm text-neutral-500`}>
            <span className={`font-bold`}>Anchor Text:</span>{" "}
            {decode(link.anchor_text)}
          </p>
        ) : (
          <p className={`mt-1 text-sm text-red-600`}>No anchor text found</p>
        )}

        <Link
          href={link.destination_url}
          target={`_blank`}
          className={`mt-2 pt-1 flex items-center w-fit border-t border-neutral-300 text-sm text-primary-500 hover:text-primary-400 transition-all duration-300 ease-in-out`}
        >
          Go to External Link
          <IconExternalLink size={20} className={`ml-1`} />
        </Link>
      </div>
    </div>
  );

  return (
    <PaginatedList
      title={title ? title : "Links"}
      items={links}
      itemType={linkDirection || "link"}
      description={
        !links || links.length === 0
          ? `No ${linkDirection}s found on this page`
          : `${links.length}x ${
              links.length === 1
                ? linkDirection || "link"
                : (linkDirection || "link") + "s"
            } found linking ${
              linkDirection === "inbound link" ? "to" : "from"
            } this page`
      }
      renderItem={renderLinkItem}
      itemsPerPage={10}
    />
  );
}
