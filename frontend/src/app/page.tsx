"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

const TICKER_ITEMS = [
  "DRAFT IN SECONDS",
  "SCHEDULE IN ADVANCE",
  "PUBLISH TO LINKEDIN, X & INSTAGRAM",
  "AI CREDITS THAT NEVER SURPRISE YOU",
  "SECURE, TOKEN-ENCRYPTED CONNECTIONS",
];

const SECTIONS = [
  {
    label: "SECTION A — DRAFT",
    title: "One prompt, three angles",
    body: "Give it a topic, a tone, and an audience. The AI copilot writes three distinct variations so you never start from a blank page.",
  },
  {
    label: "SECTION B — SCHEDULE",
    title: "Set the run date, forget it",
    body: "Draft now, publish later. Queue posts across every connected platform and let auto-publish carry them out, with an optional AI refresh right before they go live.",
  },
  {
    label: "SECTION C — PUBLISH",
    title: "Every feed, one send",
    body: "Native connections to LinkedIn, X, and Instagram/Facebook mean a single post can go out everywhere it needs to, formatted for how each platform actually reads.",
  },
  {
    label: "SECTION D — CREDITS",
    title: "Usage you can actually see",
    body: "A monthly AI credit allowance with a live meter and auto-refill. Run out mid-month and you still get a solid template draft — never an empty box.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Assign the story",
    body: "Describe the topic, pick your platforms, and set a tone and audience — the brief the AI works from.",
  },
  {
    number: "02",
    title: "Run the wire",
    body: "Review three AI-generated variations, edit the one that lands in your own voice, attach media if you need it.",
  },
  {
    number: "03",
    title: "File it",
    body: "Publish now or schedule for later. The Wire Desk holds the deadline and hits publish for you.",
  },
];

const SECURITY_POINTS = [
  "JWT-authenticated sessions on every request, not just at sign-in.",
  "OAuth 2.0 with PKCE for every platform connection — LinkedIn, X, and Instagram/Facebook.",
  "Access tokens encrypted at rest, never stored or logged in plain text.",
];

export default function Home() {
  const { user } = useAuth();
  const ctaHref = user ? "/dashboard" : "/login?tab=signup";
  const ctaLabel = user ? "Go to Dashboard" : "Start drafting free";

  return (
    <div className="flex flex-1 flex-col bg-white">
      <MastheadBar />

      <header className="flex h-16 shrink-0 items-center justify-between border-b-2 border-ink bg-white px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-muted sm:flex">
          <a href="#sections" className="hover:text-ink">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-ink">
            How it works
          </a>
          <a href="#security" className="hover:text-ink">
            Security
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard">
              <Button className="rounded-md">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-medium text-ink hover:text-primary-dark"
              >
                Log in
              </Link>
              <Link href="/login?tab=signup">
                <Button className="rounded-md">Start free</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-surface-muted px-6 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent-dark">
                Dispatch No. 001 — Product launch
              </span>
              <h1 className="mt-5 font-serif text-4xl leading-tight text-ink sm:text-5xl">
                Write it once.
                <br />
                Wire it everywhere.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted">
                The Wire Desk drafts, schedules, and publishes your posts to LinkedIn, X, and
                Instagram — with an AI copilot that turns one idea into three ready-to-post
                variations, on your voice and on your clock.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <Link href={ctaHref}>
                  <Button className="rounded-md px-5 py-2.5 font-semibold">
                    {ctaLabel} <span aria-hidden>→</span>
                  </Button>
                </Link>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-ink underline decoration-border underline-offset-4 hover:decoration-ink"
                >
                  See how it works
                </a>
              </div>

              <p className="mt-6 text-xs text-ink-muted">
                No credit card required &nbsp;·&nbsp; Free monthly AI credits &nbsp;·&nbsp; Cancel
                anytime
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-sm">
              <div
                className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl border border-border bg-white"
                aria-hidden
              />
              <div className="relative rounded-xl border border-border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                    Today&rsquo;s dispatch
                  </span>
                  <span className="rounded-full bg-accent-light px-2.5 py-1 text-xs font-semibold text-accent-dark">
                    14/20 credits
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex h-6 w-8 items-center justify-center rounded-md border border-primary bg-primary-light font-mono text-[11px] font-semibold text-primary-dark">
                    in
                  </span>
                  <span className="inline-flex h-6 w-8 items-center justify-center rounded-md border border-border bg-white font-mono text-[11px] font-semibold text-ink">
                    X
                  </span>
                  <span className="inline-flex h-6 w-8 items-center justify-center rounded-md border border-border bg-white font-mono text-[11px] font-semibold text-ink">
                    Ig
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-ink">
                  We just shipped AI credits — one simple meter so your content pipeline never
                  runs up a surprise bill. Try it from any draft today.
                </p>

                <hr className="my-4 border-border" />

                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-accent-light px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-dark">
                    Scheduled
                  </span>
                  <span className="font-mono text-xs text-ink-muted">Sep 19, 9:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <MarqueeStrip />

        {/* Sections / features */}
        <section id="sections" className="bg-white px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent-dark">
              The sections
            </span>
            <h2 className="mt-3 max-w-xl font-serif text-3xl leading-snug text-ink sm:text-4xl">
              Everything a one-person newsroom needs
            </h2>

            <div className="mt-12 grid gap-10 sm:grid-cols-2 sm:divide-x sm:divide-border lg:grid-cols-4 lg:gap-0">
              {SECTIONS.map((section) => (
                <div key={section.label} className="sm:px-8 sm:first:pl-0">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                    {section.label}
                  </span>
                  <h3 className="mt-2 font-semibold text-ink">{section.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-surface-muted px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent-dark">
              The dispatch log
            </span>
            <h2 className="mt-3 max-w-xl font-serif text-3xl leading-snug text-ink sm:text-4xl">
              From idea to published, in three moves
            </h2>

            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number}>
                  <span className="font-serif text-5xl text-primary">{step.number}</span>
                  <h3 className="mt-3 font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="bg-white px-6 py-20">
          <div className="mx-auto max-w-2xl border-t border-ink pt-10 text-center">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Filed under: security
            </span>
            <h2 className="mx-auto mt-3 font-serif text-3xl leading-snug text-ink sm:text-4xl">
              Built the way a newsroom keeps its sources safe
            </h2>

            <ul className="mx-auto mt-8 max-w-xl space-y-3 text-left">
              {SECURITY_POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                  <span className="mt-0.5 shrink-0 font-semibold text-primary">—</span>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mx-auto mt-10 border-t border-ink" />
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary px-6 py-16 text-center">
          <h2 className="font-serif text-3xl text-white sm:text-4xl">
            Ready to file today&rsquo;s post?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/85">
            Start with your free monthly AI credits — no card, no setup call, no build step on
            your end.
          </p>
          <Link
            href={ctaHref}
            className="mt-6 inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-primary-dark transition-colors hover:bg-surface-muted"
          >
            {ctaLabel}
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function MastheadBar() {
  return (
    <div className="grid grid-cols-3 items-center bg-ink px-6 py-2 font-mono text-[10px] uppercase tracking-widest text-white/70">
      <span>Vol. I — No. 001</span>
      <span className="text-center text-white/90">Your newsroom for every feed</span>
      <span className="text-right">Established 2026</span>
    </div>
  );
}

function MarqueeStrip() {
  return (
    <div className="overflow-hidden bg-ink py-3">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((rep) => (
          <ul key={rep} className="flex shrink-0 items-center" aria-hidden={rep === 1}>
            {TICKER_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center whitespace-nowrap px-6 font-mono text-[11px] uppercase tracking-widest text-white/80"
              >
                {item}
                <span className="ml-6 text-white/25">/</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface-muted px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-ink-muted">A newsroom for every feed.</p>
          </div>

          <FooterColumn
            title="Product"
            links={[
              { label: "Features", href: "#sections" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Security", href: "#security" },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ]}
          />
          <FooterColumn
            title="Legal"
            links={[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} The Wire Desk. All dispatches reserved.</span>
          <span>Built for solo creators &amp; small teams.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <span className="font-mono text-xs font-semibold uppercase tracking-widest text-ink-muted">
        {title}
      </span>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-sm text-ink-muted hover:text-ink">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
