"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LiveClock } from "@/components/live/Live";
import { Logo } from "./Logo";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", short: "Desk", icon: GridIcon },
  { href: "/posts", label: "Posts", short: "Posts", icon: DocIcon },
  { href: "/schedule", label: "Schedule", short: "Schedule", icon: CalendarIcon },
  { href: "/social-accounts", label: "Social Accounts", short: "Accounts", icon: LinkIcon },
  { href: "/settings", label: "Settings", short: "Settings", icon: GearIcon },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-rule bg-paper-deep/60 md:flex">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <div className="px-4">
        <Link
          href="/posts/new"
          className="group flex items-center justify-between rounded-[8px] bg-accent px-3.5 py-2.5 text-sm font-semibold text-white shadow-[3px_3px_0_var(--color-ink)] transition-all hover:-translate-y-px hover:shadow-[4px_4px_0_var(--color-ink)]"
        >
          File a new story
          <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-white/20 transition-transform group-hover:rotate-90">
            +
          </span>
        </Link>
      </div>

      <p className="mt-7 px-6 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        Sections
      </p>
      <nav className="mt-2 flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item, i) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-[7px] px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-ink text-paper" : "text-ink-muted hover:bg-card hover:text-ink"
              }`}
            >
              <Icon className="h-[17px] w-[17px]" />
              {item.label}
              <span className={`ml-auto font-mono text-[10px] ${active ? "text-paper/50" : "text-ink-muted/50"}`}>
                {String.fromCharCode(65 + i)}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mb-3 rounded-[8px] border border-rule bg-card px-3 py-2.5">
        <p className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="live-dot text-primary" /> Wire open
          </span>
          <LiveClock className="text-ink" />
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-rule px-4 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-base text-white">
          {user?.name?.[0]?.toUpperCase() ?? "?"}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{user?.name ?? "..."}</p>
          <p className="truncate text-xs text-ink-muted">{user?.email ?? ""}</p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-ink bg-paper/95 backdrop-blur md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-2 text-[10px] font-medium ${
              active ? "text-ink" : "text-ink-muted"
            }`}
          >
            <span className={`flex h-7 w-10 items-center justify-center rounded-full ${active ? "bg-ink text-paper" : ""}`}>
              <Icon className="h-4 w-4" />
            </span>
            {item.short}
          </Link>
        );
      })}
    </nav>
  );
}

function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="2.5" y="2.5" width="6.5" height="8" rx="1" />
      <rect x="11" y="2.5" width="6.5" height="4.5" rx="1" />
      <rect x="2.5" y="12.5" width="6.5" height="5" rx="1" />
      <rect x="11" y="9" width="6.5" height="8.5" rx="1" />
    </svg>
  );
}

function DocIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M5 2.5h7l3 3v12h-10z" strokeLinejoin="round" />
      <path d="M12 2.5v3h3" strokeLinejoin="round" />
      <path d="M7 10h6M7 13h6M7 16h4" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="2.5" y="4" width="15" height="13.5" rx="1.5" />
      <path d="M2.5 8h15M6 2v3.5M14 2v3.5" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M8.5 11.5a3 3 0 0 0 4.24 0l2-2a3 3 0 0 0-4.24-4.24l-1 1" strokeLinecap="round" />
      <path d="M11.5 8.5a3 3 0 0 0-4.24 0l-2 2a3 3 0 0 0 4.24 4.24l1-1" strokeLinecap="round" />
    </svg>
  );
}

function GearIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="10" cy="10" r="2.6" />
      <path
        d="M10 2.8v2M10 15.2v2M17.2 10h-2M4.8 10h-2M15 5l-1.4 1.4M6.4 13.6L5 15M15 15l-1.4-1.4M6.4 6.4L5 5"
        strokeLinecap="round"
      />
    </svg>
  );
}
