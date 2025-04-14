"use client";

import { useState, useEffect } from "react";
import { IconBell } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "../../../database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function Header() {
  const [user, setUser] = useState<Profile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setUser(data as Profile);
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="bg-white border-b border-neutral-200 h-16 flex items-center px-6">
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-neutral-800">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-neutral-500 hover:text-neutral-700">
          <IconBell className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-neutral-300 overflow-hidden">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-600 text-white text-sm font-medium">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-neutral-700">
            {user?.full_name || user?.email || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
