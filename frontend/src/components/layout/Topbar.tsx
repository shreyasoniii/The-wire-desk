"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getCredits } from "@/lib/api";
import type { Credits } from "@/lib/types";
import { CreditMeter } from "@/components/ui/CreditMeter";
import { Logo } from "./Logo";

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
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="flex h-12 items-center justify-between px-4 md:hidden">
        <Logo />
      </div>
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          {subtitle && (
            <p className="truncate font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              {subtitle}
            </p>
          )}
          <h1 className="font-serif text-2xl leading-tight text-ink">{title}</h1>
        </div>

        <div className="flex items-center gap-2.5">
          {action}

          {credits && (
            <CreditMeter credits={credits.credits} allowance={credits.monthlyCreditAllowance} />
          )}

          <button
            type="button"
            aria-label="Notifications"
            className="hidden h-9 w-9 items-center justify-center rounded-[7px] border border-rule-strong/70 bg-card text-ink-muted transition-colors hover:border-ink hover:text-ink sm:flex"
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
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-full border border-rule-strong/70 bg-card py-1 pl-1 pr-2.5 transition-colors hover:border-ink"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-serif text-sm text-white">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </span>
              <span className="hidden text-sm font-medium text-ink sm:inline">{user?.name?.split(" ")[0] ?? ""}</span>
              <svg viewBox="0 0 20 20" className={`h-3.5 w-3.5 text-ink-muted transition-transform ${menuOpen ? "rotate-180" : ""}`}>
                <path d="M5.5 7.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="animate-rise absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-[8px] border border-ink bg-card shadow-[4px_4px_0_var(--color-ink)]"
              >
                <div className="border-b border-rule px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                  <p className="truncate text-xs text-ink-muted">{user?.email}</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => router.push("/settings")}
                  className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-paper"
                >
                  Settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
