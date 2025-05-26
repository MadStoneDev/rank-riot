"use client";

import { useState, useEffect } from "react";
import { IconBell } from "@tabler/icons-react";

import DarkModeToggle from "@/components/ui/DarkModeToggle";

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
    <header
      className={`bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 h-16 flex items-center px-6`}
    >
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/*<DarkModeToggle />*/}

        {/*<button className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">*/}
        {/*  <IconBell className="w-6 h-6" />*/}
        {/*</button>*/}

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-600 overflow-hidden">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary text-white text-sm font-medium">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <span
            className={`hidden sm:block text-sm font-medium text-neutral-700 dark:text-neutral-200`}
          >
            {user?.full_name || user?.email || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
