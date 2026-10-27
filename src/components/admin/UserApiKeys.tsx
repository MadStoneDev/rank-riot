"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface AdminApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  rate_limit_per_min: number;
  monthly_quota: number | null;
  status: string;
  created_at: string | null;
  last_used_at: string | null;
}

// Admin view of a single user's API keys. Admins can set per-key rate limit and
// monthly quota and revoke keys. Minting still happens on the user's own
// settings screen (which reuses the crawler's key logic); this is management.
export default function UserApiKeys({ keys }: { keys: AdminApiKeyRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function post(action: string, body: Record<string, unknown>) {
    setError(null);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Request failed");
      return false;
    }
    return true;
  }

  async function saveLimits(id: string, rate: string, quota: string) {
    setBusyId(id);
    const rate_limit_per_min = Number(rate);
    const monthly_quota = quota.trim() === "" ? null : Number(quota);
    const ok = await post("set_api_key_limits", {
      keyId: id,
      rate_limit_per_min,
      monthly_quota,
    });
    setBusyId(null);
    if (ok) router.refresh();
  }

  async function revoke(id: string) {
    setBusyId(id);
    const ok = await post("revoke_api_key", { keyId: id });
    setBusyId(null);
    if (ok) router.refresh();
  }

  if (keys.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        This user has no API keys.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-[var(--color-score-critical)]">{error}</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]">
              <th className="py-2 pr-4 font-medium">Label</th>
              <th className="py-2 pr-4 font-medium">Prefix</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Rate/min</th>
              <th className="py-2 pr-4 font-medium">Quota/mo</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {keys.map((k) => (
              <KeyRow
                key={k.id}
                k={k}
                busy={busyId === k.id}
                onSave={saveLimits}
                onRevoke={revoke}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeyRow({
  k,
  busy,
  onSave,
  onRevoke,
}: {
  k: AdminApiKeyRow;
  busy: boolean;
  onSave: (id: string, rate: string, quota: string) => void;
  onRevoke: (id: string) => void;
}) {
  const [rate, setRate] = useState(String(k.rate_limit_per_min));
  const [quota, setQuota] = useState(k.monthly_quota == null ? "" : String(k.monthly_quota));
  const [confirming, setConfirming] = useState(false);
  const revoked = k.status !== "active";

  return (
    <tr className={revoked ? "opacity-60" : ""}>
      <td className="py-2.5 pr-4 text-[var(--color-text-primary)] font-medium">{k.name}</td>
      <td className="py-2.5 pr-4 font-mono text-xs text-[var(--color-text-secondary)]">
        {k.key_prefix}…
      </td>
      <td className="py-2.5 pr-4 text-xs">{revoked ? "Revoked" : "Active"}</td>
      <td className="py-2.5 pr-4">
        <input
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          disabled={revoked || busy}
          inputMode="numeric"
          className="w-16 text-xs rounded border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] px-2 py-1 disabled:opacity-50"
        />
      </td>
      <td className="py-2.5 pr-4">
        <input
          value={quota}
          onChange={(e) => setQuota(e.target.value)}
          disabled={revoked || busy}
          placeholder="∞"
          inputMode="numeric"
          className="w-20 text-xs rounded border border-[var(--color-border-default)] bg-[var(--color-surface-raised)] px-2 py-1 disabled:opacity-50"
        />
      </td>
      <td className="py-2.5 text-right whitespace-nowrap">
        {!revoked && (
          <>
            <button
              onClick={() => onSave(k.id, rate, quota)}
              disabled={busy}
              className="text-xs text-[var(--color-primary)] hover:underline disabled:opacity-50 mr-3"
            >
              Save
            </button>
            {confirming ? (
              <>
                <button
                  onClick={() => onRevoke(k.id)}
                  disabled={busy}
                  className="text-xs text-[var(--color-score-critical)] hover:underline mr-2"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={busy}
                  className="text-xs text-[var(--color-text-muted)] hover:underline"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-score-critical)]"
              >
                Revoke
              </button>
            )}
          </>
        )}
      </td>
    </tr>
  );
}
