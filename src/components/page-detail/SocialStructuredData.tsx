"use client";

import {
  IconBrandFacebook,
  IconBrandTwitter,
  IconCode,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import CollapsibleSection from "@/components/ui/CollapsibleSection";

interface SocialStructuredDataProps {
  openGraph?: Record<string, any> | null;
  twitterCard?: Record<string, any> | null;
  structuredData?: any | null;
  schemaTypes?: string[] | null;
}

export default function SocialStructuredData({
  openGraph,
  twitterCard,
  structuredData,
  schemaTypes,
}: SocialStructuredDataProps) {
  const hasOpenGraph = openGraph && Object.keys(openGraph).length > 0;
  const hasTwitterCard = twitterCard && Object.keys(twitterCard).length > 0;
  const hasStructuredData =
    structuredData &&
    (Array.isArray(structuredData)
      ? structuredData.length > 0
      : Object.keys(structuredData).length > 0);
  const hasSchemaTypes = schemaTypes && schemaTypes.length > 0;

  const StatusIndicator = ({
    hasData,
    label,
  }: {
    hasData: boolean;
    label: string;
  }) => (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
        hasData
          ? "bg-green-100 text-green-700"
          : "bg-neutral-100 text-neutral-500"
      }`}
    >
      {hasData ? (
        <IconCheck className="h-3 w-3" />
      ) : (
        <IconX className="h-3 w-3" />
      )}
      {label}
    </span>
  );

  const DataSection = ({
    icon,
    title,
    data,
    emptyMessage,
  }: {
    icon: React.ReactNode;
    title: string;
    data: Record<string, any> | null | undefined;
    emptyMessage: string;
  }) => {
    const hasData = data && Object.keys(data).length > 0;

    return (
      <div className="p-4 border-b border-neutral-200 last:border-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-primary">{icon}</span>
          <h4 className="text-sm font-medium text-neutral-900">{title}</h4>
          <StatusIndicator hasData={!!hasData} label={hasData ? "Complete" : "Missing"} />
        </div>
        {hasData ? (
          <div className="ml-6 space-y-2">
            {Object.entries(data!).map(([key, value]) => (
              <div key={key} className="flex flex-wrap gap-2 text-sm">
                <span className="font-medium text-neutral-600 min-w-[100px]">
                  {key}:
                </span>
                <span className="text-neutral-500 break-all">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="ml-6 text-sm text-neutral-400">{emptyMessage}</p>
        )}
      </div>
    );
  };

  const completeness =
    [hasOpenGraph, hasTwitterCard, hasStructuredData || hasSchemaTypes].filter(
      Boolean
    ).length;

  return (
    <CollapsibleSection
      title="Social & Structured Data"
      defaultOpen={false}
      badge={
        <div className="flex items-center gap-2">
          <StatusIndicator hasData={!!hasOpenGraph} label="OG" />
          <StatusIndicator hasData={!!hasTwitterCard} label="Twitter" />
          <StatusIndicator
            hasData={!!(hasStructuredData || hasSchemaTypes)}
            label="Schema"
          />
        </div>
      }
    >
      <DataSection
        icon={<IconBrandFacebook className="h-5 w-5" />}
        title="Open Graph"
        data={openGraph}
        emptyMessage="No Open Graph tags found"
      />

      <DataSection
        icon={<IconBrandTwitter className="h-5 w-5" />}
        title="Twitter Card"
        data={twitterCard}
        emptyMessage="No Twitter Card tags found"
      />

      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-primary">
            <IconCode className="h-5 w-5" />
          </span>
          <h4 className="text-sm font-medium text-neutral-900">
            Structured Data / Schema
          </h4>
          <StatusIndicator
            hasData={!!(hasStructuredData || hasSchemaTypes)}
            label={hasStructuredData || hasSchemaTypes ? "Present" : "Missing"}
          />
        </div>

        {hasSchemaTypes ? (
          <div className="ml-6">
            <p className="text-sm text-neutral-600 mb-2">Schema types found:</p>
            <div className="flex flex-wrap gap-2">
              {schemaTypes!.map((type, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        ) : hasStructuredData ? (
          <div className="ml-6">
            <details className="text-sm">
              <summary className="cursor-pointer text-neutral-600 hover:text-neutral-900">
                View raw structured data
              </summary>
              <pre className="mt-2 p-2 bg-neutral-50 rounded text-xs overflow-x-auto">
                {JSON.stringify(structuredData, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <p className="ml-6 text-sm text-neutral-400">
            No structured data found
          </p>
        )}
      </div>
    </CollapsibleSection>
  );
}
