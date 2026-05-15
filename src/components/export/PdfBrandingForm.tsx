"use client";

import { useState, useEffect, useCallback } from "react";
import { PdfBranding } from "@/utils/pdf-report";

const STORAGE_KEY = "rankriot-pdf-branding";

interface PdfBrandingFormProps {
  onBrandingChange: (branding: PdfBranding) => void;
}

function loadSavedBranding(): PdfBranding & { remember: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...parsed, remember: true };
    }
  } catch {
    // ignore
  }
  return { businessName: "", clientName: "", logoBase64: "", remember: false };
}

export default function PdfBrandingForm({ onBrandingChange }: PdfBrandingFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [clientName, setClientName] = useState("");
  const [logoBase64, setLogoBase64] = useState("");
  const [remember, setRemember] = useState(false);
  const [logoFilename, setLogoFilename] = useState("");

  useEffect(() => {
    const saved = loadSavedBranding();
    setBusinessName(saved.businessName || "");
    setClientName(saved.clientName || "");
    setLogoBase64(saved.logoBase64 || "");
    setRemember(saved.remember);
    if (saved.logoBase64) setLogoFilename("Saved logo");
    onBrandingChange({
      businessName: saved.businessName,
      clientName: saved.clientName,
      logoBase64: saved.logoBase64,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propagate = useCallback(
    (b: string, c: string, l: string, r: boolean) => {
      const branding: PdfBranding = { businessName: b, clientName: c, logoBase64: l };
      onBrandingChange(branding);
      if (r) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    [onBrandingChange],
  );

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      alert("Logo must be under 500 KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setLogoBase64(base64);
      setLogoFilename(file.name);
      propagate(businessName, clientName, base64, remember);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-[var(--color-border-default)] rounded-lg p-4 space-y-3 bg-[var(--color-surface-overlay)]">
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">PDF Branding</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--color-text-muted)] mb-1">Business Name</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              propagate(e.target.value, clientName, logoBase64, remember);
            }}
            placeholder="Your Company"
            className="w-full px-3 py-2 text-sm border border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--color-text-muted)] mb-1">Client Name</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
              propagate(businessName, e.target.value, logoBase64, remember);
            }}
            placeholder="Client Name"
            className="w-full px-3 py-2 text-sm border border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--color-text-muted)] mb-1">Logo</label>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium border border-[var(--color-border-default)] rounded-lg bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-hover)] transition-colors">
            {logoFilename || "Upload logo"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
          {logoBase64 && (
            <button
              onClick={() => {
                setLogoBase64("");
                setLogoFilename("");
                propagate(businessName, clientName, "", remember);
              }}
              className="text-xs text-[var(--color-score-critical)] hover:text-[var(--color-score-critical)]/80"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] cursor-pointer">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => {
            setRemember(e.target.checked);
            propagate(businessName, clientName, logoBase64, e.target.checked);
          }}
          className="rounded border-[var(--color-border-default)] text-primary focus:ring-primary"
        />
        Remember branding
      </label>
    </div>
  );
}
