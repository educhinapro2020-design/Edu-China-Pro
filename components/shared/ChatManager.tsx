"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { Database } from "@/lib/types/supabase";

type UserRole = Database["public"]["Enums"]["user_role"];

const TAWK_SRC = "https://embed.tawk.to/69a999f58553a21c37dae42f/1jiv82r6h";

export function ChatManager() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; role: UserRole } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function getInitialUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          role: (session.user.user_metadata?.role as UserRole) || "student",
        });
      }
      setLoading(false);
    }

    getInitialUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          role: (session.user.user_metadata?.role as UserRole) || "student",
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isInternalRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/counselor");

  const showTawk = !loading && !user && !isInternalRoute;

  useEffect(() => {
    if (!showTawk) {
      if ((window as any).Tawk_API?.hideWidget) {
        (window as any).Tawk_API.hideWidget();
      }
      return () => {
        if ((window as any).Tawk_API?.hideWidget) {
          (window as any).Tawk_API.hideWidget();
        }
      };
    }

    if ((window as any).Tawk_API?.showWidget) {
      (window as any).Tawk_API.showWidget();
      return;
    }

    if (document.querySelector(`script[src*="tawk.to"]`)) return;

    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.async = true;
    script.src = TAWK_SRC;
    script.setAttribute("crossorigin", "*");
    document.head.appendChild(script);

    return () => {
      if ((window as any).Tawk_API?.hideWidget) {
        (window as any).Tawk_API.hideWidget();
      }
    };
  }, [showTawk]);

  if (loading) return null;

  if (user?.role === "student") {
    return <FloatingChat currentUserId={user.id} currentUserRole="student" />;
  }

  return null;
}
