"use client";

import {
  IconBrandFacebook,
  IconBrandTwitter,
  IconCode,
  IconCheck,
  IconX,
  IconPhoto,
} from "@tabler/icons-react";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import Badge from "@/components/ui/Badge";

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
    <Badge variant={hasData ? "good" : "neutral"}>
      {hasData ? (
        <IconCheck className="h-3 w-3" />
      ) : (
        <IconX className="h-3 w-3" />
      )}
      {label}
    </Badge>
  );

  // OG Preview Card
  const OGPreviewCard = () => {
    if (!hasOpenGraph) return null;
    const ogTitle = openGraph?.["og:title"] || openGraph?.title;
    const ogDescription = openGraph?.["og:description"] || openGraph?.description;
    const ogImage = openGraph?.["og:image"] || openGraph?.image;
    const ogSiteName = openGraph?.["og:site_name"] || openGraph?.site_name;
    const ogUrl = openGraph?.["og:url"] || openGraph?.url;

    return (
      <div className="mx-6 mb-4 rounded-lg overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-surface-overlay)]">
        {ogImage && (
          <div className="w-full h-40 bg-[var(--color-surface-elevated)] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={typeof ogImage === "string" ? ogImage : ""}
              alt="OG preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <div className="p-3">
          {ogSiteName && (
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
              {String(ogSiteName)}
            </p>
          )}
          {ogTitle && (
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-2 mb-1">
              {String(ogTitle)}
            </h4>
          )}
          {ogDescription && (
            <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
              {String(ogDescription)}
            </p>
          )}
          {ogUrl && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">
              {String(ogUrl)}
            </p>
          )}
        </div>
      </div>
    );
  };

  const DataSection = ({
    icon,
    title,
    data,
    emptyMessage,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    data: Record<string, any> | null | undefined;
    emptyMessage: string;
    children?: React.ReactNode;
  }) => {
    const hasData = data && Object.keys(data).length > 0;

    return (
      <div className="p-4 border-b border-[var(--color-border-subtle)] last:border-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[var(--color-primary)]">{icon}</span>
          <h4 className="text-sm font-medium text-[var(--color-text-primary)]">{title}</h4>
          <StatusIndicator hasData={!!hasData} label={hasData ? "Complete" : "Missing"} />
        </div>
        {children}
        {hasData && !children ? (
          <div className="ml-6 space-y-2">
            {Object.entries(data!).map(([key, value]) => (
              <div key={key} className="flex flex-wrap gap-2 text-sm">
                <span className="font-medium text-[var(--color-text-secondary)] min-w-[100px]">
                  {key}:
                </span>
                <span className="text-[var(--color-text-muted)] break-all">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        ) : !hasData ? (
          <p className="ml-6 text-sm text-[var(--color-text-muted)]">{emptyMessage}</p>
        ) : null}
      </div>
    );
  };

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
      {/* OG section with preview card */}
      <DataSection
        icon={<IconBrandFacebook className="h-5 w-5" />}
        title="Open Graph"
        data={openGraph}
        emptyMessage="No Open Graph tags found"
      >
        {hasOpenGraph && (
          <>
            <OGPreviewCard />
            <div className="ml-6 space-y-2">
              {Object.entries(openGraph!).map(([key, value]) => (
                <div key={key} className="flex flex-wrap gap-2 text-sm">
                  <span className="font-medium text-[var(--color-text-secondary)] min-w-[100px]">
                    {key}:
                  </span>
                  <span className="text-[var(--color-text-muted)] break-all">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </DataSection>

      <DataSection
        icon={<IconBrandTwitter className="h-5 w-5" />}
        title="Twitter Card"
        data={twitterCard}
        emptyMessage="No Twitter Card tags found"
      />

      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[var(--color-primary)]">
            <IconCode className="h-5 w-5" />
          </span>
          <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
            Structured Data / Schema
          </h4>
          <StatusIndicator
            hasData={!!(hasStructuredData || hasSchemaTypes)}
            label={hasStructuredData || hasSchemaTypes ? "Present" : "Missing"}
          />
        </div>

        {hasSchemaTypes ? (
          <div className="ml-6">
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">Schema types found:</p>
            <div className="flex flex-wrap gap-2">
              {schemaTypes!.map((type, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded bg-[var(--color-primary-muted)] text-[var(--color-primary)] text-xs font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        ) : hasStructuredData ? (
          <div className="ml-6">
            <details className="text-sm">
              <summary className="cursor-pointer text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                View raw structured data
              </summary>
              <pre className="mt-2 p-2 bg-[var(--color-surface-overlay)] rounded text-xs overflow-x-auto text-[var(--color-text-secondary)]">
                {JSON.stringify(structuredData, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <p className="ml-6 text-sm text-[var(--color-text-muted)]">
            No structured data found
          </p>
        )}
      </div>
    </CollapsibleSection>
  );
}
