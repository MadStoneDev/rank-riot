"use client";

import { useState } from "react";
import {
  IconShieldLock,
  IconCopy,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

export interface BotProtectionInfo {
  blocked: boolean;
  blocked_pages?: number;
  total_pages?: number;
  user_agent?: string;
  egress_ip?: string | null;
}

interface BotBlockedNoticeProps {
  info: BotProtectionInfo;
  projectUrl: string;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-overlay)] px-2.5 py-1 font-mono text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
      aria-label={`Copy ${label}`}
    >
      <span className="select-all">{value}</span>
      {copied ? (
        <IconCheck className="h-3.5 w-3.5 text-[var(--color-score-good)]" />
      ) : (
        <IconCopy className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
      )}
    </button>
  );
}

// Per-host allowlist steps. Keyed by a label we try to infer from the site;
// "generic" is the always-shown fallback.
const HOST_GUIDES: { key: string; label: string; steps: string[] }[] = [
  {
    key: "siteground",
    label: "SiteGround",
    steps: [
      "Log in to SiteGround → Site Tools → Security → Blocked IPs / Anti-Bot.",
      "Add our crawler IP to the allowlist (whitelist).",
      "If using SiteGround's Anti-Bot AI, add an exception for our User-Agent.",
    ],
  },
  {
    key: "cloudflare",
    label: "Cloudflare",
    steps: [
      "Cloudflare dashboard → your domain → Security → WAF → Tools.",
      "Under IP Access Rules, add our crawler IP with action 'Allow'.",
      "Or create a WAF skip rule matching our User-Agent.",
    ],
  },
  {
    key: "sucuri",
    label: "Sucuri",
    steps: [
      "Sucuri dashboard → Firewall (WAF) → Access Control → Whitelist.",
      "Add our crawler IP to the IP whitelist.",
    ],
  },
  {
    key: "wordfence",
    label: "Wordfence (WordPress)",
    steps: [
      "WordPress admin → Wordfence → All Options → Allowlisted URLs / IPs.",
      "Add our crawler IP under 'Allowlisted IP addresses'.",
    ],
  },
];

export default function BotBlockedNotice({
  info,
  projectUrl,
}: BotBlockedNoticeProps) {
  const [showGuides, setShowGuides] = useState(false);
  const ip = info.egress_ip || null;
  const ua = info.user_agent || null;

  let host = projectUrl;
  try {
    host = new URL(projectUrl).hostname;
  } catch {
    /* keep raw */
  }

  return (
    <div className="rounded-lg border border-[var(--color-score-warning)]/40 bg-[var(--color-score-warning)]/10 p-5">
      <div className="flex items-start gap-3">
        <IconShieldLock className="mt-0.5 h-6 w-6 flex-shrink-0 text-[var(--color-score-warning)]" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            {host}&apos;s firewall is blocking our crawler
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            The site&apos;s host or security plugin served a bot-protection
            challenge instead of the real pages, so we could only see{" "}
            {info.blocked_pages != null && info.total_pages != null
              ? `${info.total_pages - info.blocked_pages} of ${info.total_pages} pages`
              : "very little of the site"}
            . To get a complete scan, allowlist our crawler — no change to your
            site&apos;s security otherwise.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            {ip && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  Allowlist this IP:
                </span>
                <CopyButton value={ip} label="crawler IP" />
              </div>
            )}
            {ua && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  Our User-Agent:
                </span>
                <CopyButton value={ua} label="user agent" />
              </div>
            )}
          </div>

          {!ip && (
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              Allowlisting by IP is the most reliable fix. Your host can find
              our crawler&apos;s IP in their access logs (look for the
              User-Agent above), or contact support and we&apos;ll provide it.
            </p>
          )}

          <button
            type="button"
            onClick={() => setShowGuides((s) => !s)}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            How to allowlist on common hosts
            {showGuides ? (
              <IconChevronUp className="h-4 w-4" />
            ) : (
              <IconChevronDown className="h-4 w-4" />
            )}
          </button>

          {showGuides && (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {HOST_GUIDES.map((guide) => (
                <div
                  key={guide.key}
                  className="rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] p-3"
                >
                  <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {guide.label}
                  </h4>
                  <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-xs text-[var(--color-text-secondary)]">
                    {guide.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
