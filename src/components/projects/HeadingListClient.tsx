"use client";

import { ReactNode } from "react";
import { IconHeading } from "@tabler/icons-react";
import PaginatedList from "@/components/projects/PaginatedListBlock";

export default function HeadingListClient({
  headings,
  headingType,
  criticalClass,
  icon,
  title,
}: {
  headings: string[];
  headingType?: string;
  criticalClass?: string;
  icon: ReactNode;
  title?: string;
}) {
  // Default title based on heading type if not provided
  const displayTitle =
    title || `${headingType ? headingType.toUpperCase() : "Heading"}s`;

  // Define the render function within the client component
  const renderHeadingItem = (heading: string, index: number) => (
    <div key={index} className={`p-4 flex items-start`}>
      <div className={`mt-1 flex-shrink-0 rounded-full p-1 text-primary`}>
        {icon || <IconHeading />}
      </div>
      <div className="ml-3 flex-1">
        <h4 className="text-sm font-medium text-neutral-900">{heading}</h4>
      </div>
    </div>
  );

  return (
    <PaginatedList
      title={displayTitle}
      items={headings}
      itemType={headingType ? `${headingType} heading` : "heading"}
      renderItem={renderHeadingItem}
      criticalClass={criticalClass}
      itemsPerPage={10}
    />
  );
}
