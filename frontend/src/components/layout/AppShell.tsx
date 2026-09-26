"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LogoMark } from "./Logo";
import { MobileNav, Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-paper">
        <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-[10px] bg-ink text-paper">
          <LogoMark className="h-6 w-6" />
        </span>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
          Opening the wire…
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <Sidebar />
      <div className="paper-grain flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</div>
      </div>
      <MobileNav />
    </div>
  );
}
