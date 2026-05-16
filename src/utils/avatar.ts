const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN ?? "";

export function getAvatarUrl(key: string | null): string | null {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  return `${R2_DOMAIN}/${key}`;
}
