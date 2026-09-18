"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getCredits } from "@/lib/api";
import type { Credits } from "@/lib/types";
import { CreditMeter } from "@/components/ui/CreditMeter";

export function Topbar({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [credits, setCredits] = useState<Credits | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCredits()
      .then(({ data }) => setCredits(data))
      .catch(() => setCredits(null));
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
        {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {action}

        {credits && (
          <CreditMeter
            credits={credits.credits}
            allowance={credits.monthlyCreditAllowance}
          />
        )}

        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-muted hover:bg-surface-muted"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
            <path d="M5 8a5 5 0 0110 0v3.5l1.2 2H3.8L5 11.5z" strokeLinejoin="round" />
            <path d="M8.2 15.5a1.8 1.8 0 003.6 0" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-2.5 hover:bg-surface-muted"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
            <span className="text-sm font-medium text-ink">{user?.name ?? ""}</span>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-ink-muted">
              <path d="M5.5 7.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-40 rounded-lg border border-border bg-white py-1 shadow-md">
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-surface-muted"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
