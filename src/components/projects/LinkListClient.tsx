"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { IconExternalLink, IconLink, IconPhoto } from "@tabler/icons-react";
import PaginatedList from "@/components/projects/PaginatedListBlock";

import { Database } from "../../../database.types";

type Link = Database["public"]["Tables"]["page_links"]["Row"] & {
  pages: {
    url: string;
  };
};

export default function LinkListClient({
  self,
  links,
  linkDirection,
  icon,
  title,
}: {
  self?: string;
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
      <div className="ml-3 flex-1">
        <h4 className={`text-sm font-medium text-neutral-900`}>
          {linkDirection === "inbound link" && (
            <p className="flex justify-start items-center gap-2">
              {link.pages.url}
              {self && self === link.pages.url ? (
                <span className={`font-light`}> (Self)</span>
              ) : (
                ""
              )}
              <Link href={link.pages.url} className="ml-auto">
                <IconExternalLink size={20} />
              </Link>
            </p>
          )}
          {linkDirection === "outbound link" && (
            <p className="flex justify-start items-center gap-2">
              {link.destination_url}
              {self && self === link.destination_url ? (
                <span className={`font-light`}> (Self)</span>
              ) : (
                ""
              )}
              <Link href={link.destination_url} className="ml-auto">
                <IconExternalLink size={20} />
              </Link>
            </p>
          )}
        </h4>

        {link.anchor_text && link.anchor_text.length > 0 ? (
          <p className={`mt-1 text-sm text-neutral-500`}>
            <span className={`font-bold`}>Anchor Text:</span> {link.anchor_text}
          </p>
        ) : (
          <p className={`mt-1 text-sm text-red-600`}>No anchor text found</p>
        )}
      </div>
    </div>
  );

  return (
    <PaginatedList
      title={title ? title : "Links"}
      items={links}
      itemType={linkDirection || "link"}
      renderItem={renderLinkItem}
      itemsPerPage={10}
    />
  );
}
