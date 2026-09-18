"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { PlatformIcon } from "@/components/ui/PlatformIcon";

const FEATURES = [
  {
    title: "Draft with AI, on a budget",
    body: "Generate three on-brand variants from a topic, tone and audience — then edit freely. Every generation uses one AI credit, tracked in real time.",
    icon: SparkleIcon,
  },
  {
    title: "Publish everywhere, once",
    body: "Pick LinkedIn, X and Instagram for a post and The Wire Desk creates one tailored copy per platform from a single draft.",
    icon: BroadcastIcon,
  },
  {
    title: "Schedule and know what shipped",
    body: "Queue posts for later with optional auto-regenerate before publish, and see exactly which ones went out — and which didn't.",
    icon: CalendarIcon,
  },
];

export default function Home() {
  const { user } = useAuth();
  const ctaHref = user ? "/dashboard" : "/login?tab=signup";
  const ctaLabel = user ? "Go to Dashboard" : "Create your account";

  return (
    <div className="flex flex-1 flex-col bg-surface-muted">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-6">
        <Logo />
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/login?tab=signup">
                <Button>Get started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark">
            A newsroom for every feed
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Run your social feed like a newsroom.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-muted">
            Draft with AI, schedule across LinkedIn, X and Instagram, and see what actually
            went out — all from one wire desk.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={ctaHref}>
              <Button className="px-6 py-3 text-base">{ctaLabel}</Button>
            </Link>
            {!user && (
              <Link href="/login">
                <Button variant="outline" className="px-6 py-3 text-base">
                  Sign in
                </Button>
              </Link>
            )}
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            <PlatformIcon platform="LinkedIn" />
            <PlatformIcon platform="X" />
            <PlatformIcon platform="Instagram" />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map(({ title, body, icon: Icon }) => (
              <div key={title} className="rounded-xl border border-border bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary-dark">
                  <Icon />
                </span>
                <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm text-ink-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-white px-6 py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
            <h2 className="text-2xl font-semibold text-ink">Ready to file your first story?</h2>
            <p className="text-ink-muted">
              {user
                ? "Head back to your dashboard to pick up where you left off."
                : "Sign up free and start with 20 AI credits a month."}
            </p>
            <Link href={ctaHref}>
              <Button className="px-6 py-3 text-base">{ctaLabel}</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} The Wire Desk · A newsroom for every feed
      </footer>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path d="M10 2l1.6 4.7L16.5 8l-4.9 1.3L10 14l-1.6-4.7L3.5 8l4.9-1.3L10 2z" />
    </svg>
  );
}
function BroadcastIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
      <path d="M4 8.5C8.5 4 11.5 4 16 8.5" strokeLinecap="round" />
      <path d="M7 12C9.8 9 10.2 9 13 12" strokeLinecap="round" />
      <circle cx="10" cy="16.5" r="1.6" fill="currentColor" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
      <rect x="2.5" y="4" width="15" height="13.5" rx="1.5" />
      <path d="M2.5 8h15M6 2v3.5M14 2v3.5" strokeLinecap="round" />
    </svg>
  );
}
