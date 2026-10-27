"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { ApiKeyRecord } from "@/lib/api-keys-client";
import {
  createApiKeyAction,
  revokeApiKeyAction,
} from "@/app/(redesign)/dashboard/settings/actions";

const SCOPES: { value: string; label: string }[] = [
  { value: "jobs:read", label: "Jobs — read" },
  { value: "jobs:write", label: "Jobs — write" },
  { value: "projects:read", label: "Projects — read" },
  { value: "projects:write", label: "Projects — write" },
];

export default function ApiKeysSection({
  initialKeys,
}: {
  initialKeys: ApiKeyRecord[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [scopes, setScopes] = useState<string[]>(["jobs:read"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const toggleScope = (s: string) =>
    setScopes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  async function handleCreate() {
    setError(null);
    if (!label.trim()) {
      setError("Give the key a label.");
      return;
    }
    if (scopes.length === 0) {
      setError("Select at least one scope.");
      return;
    }
    setBusy(true);
    const res = await createApiKeyAction({ name: label.trim(), scopes });
    setBusy(false);
    if (res.error || !res.key) {
      setError(res.error || "Could not create the key.");
      return;
    }
    setNewKey(res.key);
    setLabel("");
    setScopes(["jobs:read"]);
    setCreating(false);
    router.refresh();
  }

  async function handleRevoke(id: string) {
    setBusy(true);
    const res = await revokeApiKeyAction(id);
    setBusy(false);
    setRevokingId(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  async function copyKey() {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the key is visible to select manually.
    }
  }

  return (
    <div className="space-y-4">
      {/* The one-time key reveal */}
      {newKey && (
        <div className="rounded-xl border border-[var(--color-score-warning)] bg-[var(--color-score-warning)]/10 p-4">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Copy your new key now
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            This is the only time the full key is shown. You won&apos;t be able to
            see it again — store it somewhere safe.
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <code className="text-xs font-mono bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] rounded px-2 py-1.5 break-all flex-1 min-w-[200px]">
              {newKey}
            </code>
            <button
              onClick={copyKey}
              className="text-sm rounded-md border border-[var(--color-border-default)] px-3 py-1.5 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-3 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] underline"
          >
            I&apos;ve saved it — dismiss
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--color-score-critical)]">{error}</p>
      )}

      {/* Key list */}
      {initialKeys.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          You don&apos;t have any API keys yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]">
                <th className="py-2 pr-4 font-medium">Label</th>
                <th className="py-2 pr-4 font-medium">Prefix</th>
                <th className="py-2 pr-4 font-medium">Scopes</th>
                <th className="py-2 pr-4 font-medium">Created</th>
                <th className="py-2 pr-4 font-medium">Last used</th>
                <th className="py-2 pr-4 font-medium">This month</th>
                <th className="py-2 pr-4 font-medium">Quota</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {initialKeys.map((k) => {
                const revoked = k.status !== "active";
                return (
                  <tr key={k.id} className={revoked ? "opacity-60" : ""}>
                    <td className="py-2.5 pr-4 text-[var(--color-text-primary)] font-medium">
                      {k.name}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-[var(--color-text-secondary)]">
                      {k.key_prefix}…
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-[var(--color-text-secondary)]">
                      {(k.scopes ?? []).join(", ")}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-[var(--color-text-muted)]">
                      {k.created_at ? format(new Date(k.created_at), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-[var(--color-text-muted)]">
                      {k.last_used_at
                        ? format(new Date(k.last_used_at), "MMM d, yyyy")
                        : "Never"}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-[var(--color-text-secondary)]">
                      {k.usage.requests} req · {k.usage.jobs_created} jobs
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-[var(--color-text-secondary)]">
                      {k.monthly_quota == null ? "Unlimited" : `${k.monthly_quota}/mo`}
                    </td>
                    <td className="py-2.5 pr-4 text-xs">
                      <span
                        className={
                          revoked
                            ? "text-[var(--color-text-muted)]"
                            : "text-[var(--color-score-good)]"
                        }
                      >
                        {revoked ? "Revoked" : "Active"}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      {!revoked &&
                        (revokingId === k.id ? (
                          <span className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleRevoke(k.id)}
                              disabled={busy}
                              className="text-xs text-[var(--color-score-critical)] hover:underline disabled:opacity-50"
                            >
                              Confirm revoke
                            </button>
                            <button
                              onClick={() => setRevokingId(null)}
                              disabled={busy}
                              className="text-xs text-[var(--color-text-muted)] hover:underline"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setRevokingId(k.id)}
                            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-score-critical)]"
                          >
                            Revoke
                          </button>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create */}
      {creating ? (
        <div className="rounded-xl border border-[var(--color-border-default)] p-4 space-y-3">
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">
              Label
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Vanward integration"
              maxLength={100}
              className="w-full text-sm rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1.5">Scopes</p>
            <div className="flex flex-wrap gap-3">
              {SCOPES.map((s) => (
                <label
                  key={s.value}
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]"
                >
                  <input
                    type="checkbox"
                    checked={scopes.includes(s.value)}
                    onChange={() => toggleScope(s.value)}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreate}
              disabled={busy}
              className="text-sm rounded-md bg-[var(--color-primary)] text-white px-3 py-1.5 disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create key"}
            </button>
            <button
              onClick={() => {
                setCreating(false);
                setError(null);
              }}
              disabled={busy}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="text-sm rounded-md border border-[var(--color-border-default)] px-3 py-1.5 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
        >
          Create API key
        </button>
      )}
    </div>
  );
}
