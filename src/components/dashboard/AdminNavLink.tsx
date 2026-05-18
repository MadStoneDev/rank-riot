"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { IconShieldCog } from "@tabler/icons-react";

export default function AdminNavLink() {
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.role === "admin") setIsAdmin(true);
        });
    });
  }, []);

  if (!isAdmin) return null;

  const isActive = pathname.startsWith("/admin");

  return (
    <Link
      href="/admin"
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)]"
      }`}
    >
      <IconShieldCog className="w-[18px] h-[18px]" stroke={isActive ? 2 : 1.5} />
      Admin
    </Link>
  );
}
