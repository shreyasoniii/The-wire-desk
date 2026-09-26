"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { Logo, LogoMark } from "@/components/layout/Logo";
import { LiveClock, useNow } from "@/components/live/Live";
import { ComposerDemo } from "@/components/landing/ComposerDemo";
import { QueueDemo } from "@/components/landing/QueueDemo";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { GlobeFallback } from "@/components/three/WireGlobe";

const WireGlobe = dynamic(() => import("@/components/three/WireGlobe"), {
  ssr: false,
  loading: () => <GlobeFallback />,
});

const TICKER_ITEMS = [
  "Draft in seconds",
  "Schedule in advance",
  "Publish to LinkedIn, X & Instagram",
  "AI credits that never surprise you",
  "Token-encrypted connections",
  "Auto-refresh before publish",
];

const BRIEFS = [
  {
    label: "B — Schedule",
    title: "Set the run date, forget it",
    body: "Queue posts across every connected platform. Auto-publish carries them out, with an optional AI refresh right before they go live.",
  },
  {
    label: "C — Publish",
    title: "Every feed, one send",
    body: "Native connections to LinkedIn, X and Instagram/Facebook mean one post goes everywhere it needs to.",
  },
  {
    label: "D — Credits",
    title: "Usage you can actually see",
    body: "A monthly allowance with a live meter and auto-refill. Run dry mid-month and you still get a solid template draft.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Assign the story",
    body: "Describe the topic, pick your platforms, set a tone and audience — the brief the AI works from.",
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
  { k: "JWT", v: "Authenticated sessions on every request, not just at sign-in." },
  { k: "PKCE", v: "OAuth 2.0 with PKCE for every platform connection — LinkedIn, X and Instagram/Facebook." },
  { k: "AES", v: "Access tokens encrypted at rest, never stored or logged in plain text." },
];

export default function Home() {
  const { user } = useAuth();
  const ctaHref = user ? "/dashboard" : "/login?tab=signup";
  const ctaLabel = user ? "Go to your desk" : "Start drafting free";

  return (
    <div className="paper-grain flex flex-1 flex-col bg-paper">
      <MastheadBar />

      <header className="sticky top-0 z-30 border-b border-ink bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-ink-muted md:flex">
            <a href="#try" className="transition-colors hover:text-ink">Try it</a>
            <a href="#sections" className="transition-colors hover:text-ink">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-ink">How it works</a>
            <a href="#security" className="transition-colors hover:text-ink">Security</a>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <Link href="/dashboard" className={inkBtn}>
                Dashboard <span aria-hidden>→</span>
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 text-sm font-medium text-ink hover:text-primary">
                  Log in
                </Link>
                <Link href="/login?tab=signup" className={inkBtn}>
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — front page */}
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:pt-12">
          <div className="rule-double flex flex-wrap items-center justify-between gap-2 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">
            <span>Front page</span>
            <TodayLine />
            <span className="hidden sm:inline">Late edition · Free to read</span>
          </div>

          <div className="grid items-center gap-8 border-b border-ink pb-10 pt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-4">
            <div className="animate-rise">
              <p className="inline-flex items-center gap-2 rounded-full border border-ink/80 px-3 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em]">
                <span className="live-dot text-accent" /> Now filing to 3 platforms
              </p>
              <h1 className="mt-6 font-serif text-[clamp(2.9rem,7.2vw,6.4rem)] font-medium leading-[0.92] text-ink">
                Write it once.
                <br />
                <span className="font-serif-italic text-primary">Wire it</span> everywhere.
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-muted">
                The Wire Desk drafts, schedules and publishes your posts to LinkedIn, X and Instagram
                — with an AI copilot that turns one idea into three ready-to-post variations, in your
                voice and on your clock.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={ctaHref}
                  className="group inline-flex items-center gap-3 rounded-[6px] bg-accent px-6 py-3.5 text-[15px] font-semibold text-white shadow-[4px_4px_0_var(--color-ink)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)] active:translate-y-0 active:shadow-[2px_2px_0_var(--color-ink)]"
                >
                  {ctaLabel}
                  <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
                </Link>
                <a href="#try" className="text-sm font-semibold text-ink underline decoration-rule-strong decoration-2 underline-offset-[6px] hover:decoration-accent">
                  Try the desk — no signup
                </a>
              </div>

              <dl className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-rule border-y border-rule py-3">
                {[
                  ["3", "variants per brief"],
                  ["3", "native platforms"],
                  ["0", "cards to start"],
                ].map(([n, l]) => (
                  <div key={l} className="px-3 first:pl-0">
                    <dt className="sr-only">{l}</dt>
                    <dd className="font-serif text-3xl leading-none text-ink">{n}</dd>
                    <dd className="mt-1 text-xs text-ink-muted">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="relative mx-auto aspect-square w-full max-w-[600px]">
                <WireGlobe />
                <GlobeAnnotations />
              </div>
            </div>
          </div>
        </section>

        <MarqueeStrip />

        {/* Interactive demo */}
        <section id="try" className="scroll-mt-20 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionHead kicker="Try the desk" title={<>Hand it a topic. Watch <span className="font-serif-italic">three angles</span> come off the wire.</>}>
              Change the brief, pick a tone and hit run. The fit meters track each platform&rsquo;s
              character limit live as the copy prints.
            </SectionHead>
            <div className="reveal mt-10">
              <ComposerDemo />
            </div>
          </div>
        </section>

        {/* Features — lead story + briefs */}
        <section id="sections" className="scroll-mt-20 border-y border-ink bg-card px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionHead kicker="The sections" title="Everything a one-person newsroom needs" />

            <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-0">
              <article className="reveal lg:border-r lg:border-rule lg:pr-10">
                <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  A — Draft · Lead story
                </p>
                <h3 className="mt-3 font-serif text-4xl leading-[1.05] text-ink sm:text-5xl">
                  One prompt, <span className="font-serif-italic">three angles.</span>
                </h3>
                <div className="mt-5 gap-8 text-[15px] leading-relaxed text-ink-muted sm:columns-2">
                  <p className="first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-ink">
                    Give it a topic, a tone and an audience. The AI copilot writes three distinct
                    variations so you never start from a blank page.
                  </p>
                  <p className="mt-4 sm:mt-0">
                    Pick the one that lands, rewrite it in your own voice, attach media, and send it
                    to every platform you&rsquo;ve connected — each post formatted for how that
                    feed actually reads.
                  </p>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {(["LinkedIn", "X", "Instagram"] as const).map((p, i) => (
                    <div key={p} className="rounded-[8px] border border-rule bg-paper p-3.5" style={{ transform: `rotate(${[-1.2, 0.6, -0.4][i]}deg)` }}>
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={p} size="sm" />
                        <span className="text-xs font-semibold text-ink">{p}</span>
                        <span className="ml-auto font-mono text-[10px] text-ink-muted">Var {"ABC"[i]}</span>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <div className="h-1.5 w-full rounded bg-rule" />
                        <div className="h-1.5 w-11/12 rounded bg-rule" />
                        <div className="h-1.5 w-2/3 rounded bg-rule" />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <div className="lg:pl-10">
                <div className="divide-y divide-rule">
                  {BRIEFS.map((b) => (
                    <article key={b.label} className="reveal py-6 first:pt-0">
                      <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{b.label}</p>
                      <h3 className="mt-1.5 font-serif text-2xl leading-tight text-ink">{b.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{b.body}</p>
                    </article>
                  ))}
                </div>
                <div className="reveal mt-2">
                  <QueueDemo />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionHead kicker="The dispatch log" title="From idea to published, in three moves" />
            <ol className="relative mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
              <span className="absolute left-0 right-0 top-[34px] hidden border-t border-dashed border-ink/40 md:block" aria-hidden />
              {STEPS.map((step) => (
                <li key={step.number} className="reveal relative">
                  <span className="relative inline-flex h-[68px] w-[68px] items-center justify-center rounded-full border border-ink bg-paper font-serif text-3xl text-ink">
                    {step.number}
                  </span>
                  <h3 className="mt-5 font-serif text-2xl text-ink">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="scroll-mt-20 bg-ink px-4 py-20 text-paper sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="reveal">
              <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-accent">
                Filed under: security
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-[1.05] sm:text-5xl">
                Built the way a newsroom keeps its <span className="font-serif-italic text-[#9fd1ad]">sources safe.</span>
              </h2>
              <div className="mt-8 inline-flex -rotate-3 flex-col items-center rounded-[6px] border-2 border-accent px-5 py-2 text-accent">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Verified</span>
                <span className="font-serif text-xl font-semibold uppercase tracking-wider">Off the record</span>
              </div>
            </div>
            <ul className="divide-y divide-paper/15 border-y border-paper/15">
              {SECURITY_POINTS.map((point) => (
                <li key={point.k} className="reveal grid grid-cols-[72px_1fr] items-baseline gap-4 py-6">
                  <span className="font-mono text-sm font-semibold text-accent">{point.k}</span>
                  <p className="text-lg leading-snug text-paper/85">{point.v}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-primary px-4 py-24 text-center sm:px-6">
          <div className="halftone absolute inset-0 text-white/10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" aria-hidden />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-serif text-5xl leading-[1] text-white sm:text-6xl">
              Ready to file <span className="font-serif-italic">today&rsquo;s</span> post?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-white/80">
              Start with your free monthly AI credits — no card, no setup call.
            </p>
            <Link
              href={ctaHref}
              className="mt-8 inline-flex items-center gap-3 rounded-[6px] bg-paper px-6 py-3.5 text-[15px] font-semibold text-ink shadow-[4px_4px_0_var(--color-ink)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)]"
            >
              {ctaLabel} <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

const inkBtn =
  "inline-flex items-center gap-2 rounded-[6px] bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-primary";

function SectionHead({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="reveal grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
      <div>
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-accent-dark">{kicker}</p>
        <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.05] text-ink sm:text-5xl">{title}</h2>
      </div>
      {children && <p className="max-w-md text-[15px] leading-relaxed text-ink-muted lg:justify-self-end">{children}</p>}
    </div>
  );
}

function TodayLine() {
  const now = useNow();
  return (
    <span className="text-ink">
      {now
        ? new Date(now).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
        : " "}
    </span>
  );
}

function GlobeAnnotations() {
  return (
    <div className="pointer-events-none absolute inset-0 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-muted" aria-hidden>
      <div className="absolute left-0 top-4 border-l border-ink pl-2">
        <p className="text-ink">Desk · 19.07°N 72.87°E</p>
        <p>Outbound wire</p>
      </div>
      <div className="absolute bottom-6 right-0 space-y-0.5 border-r border-ink pr-2 text-right">
        <p><LiveClock timeZone="America/New_York" label="NYC" /></p>
        <p><LiveClock timeZone="Europe/London" label="LDN" /></p>
        <p className="text-ink"><LiveClock timeZone="Asia/Tokyo" label="TYO" /></p>
      </div>
      <p className="absolute bottom-6 left-0">Drag to spin ↔</p>
    </div>
  );
}

function MastheadBar() {
  return (
    <div className="bg-ink text-paper/70">
      <div className="mx-auto grid max-w-7xl grid-cols-2 items-center px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] sm:grid-cols-3 sm:px-6">
        <span className="hidden sm:inline">Vol. I — No. 001</span>
        <span className="text-paper/90 sm:text-center">A newsroom for every feed</span>
        <span className="flex items-center justify-end gap-2">
          <span className="live-dot text-accent" />
          Wire time <LiveClock className="text-paper" />
        </span>
      </div>
    </div>
  );
}

function MarqueeStrip() {
  return (
    <div className="overflow-hidden border-y border-ink bg-accent py-3 text-ink">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((rep) => (
          <ul key={rep} className="flex shrink-0 items-center" aria-hidden={rep === 1}>
            {TICKER_ITEMS.map((item) => (
              <li key={item} className="flex items-center whitespace-nowrap px-6 font-serif text-xl font-medium">
                {item}
                <LogoMark className="ml-12 h-4 w-4 text-ink" />
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
    <footer className="bg-paper px-4 pt-14 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-ink-muted">
              Draft, schedule and publish to every feed from one desk. Built for solo creators and small teams.
            </p>
          </div>
          <FooterColumn
            title="Product"
            links={[
              { label: "Try it", href: "#try" },
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

        <p
          className="mt-14 select-none whitespace-nowrap border-t border-ink pt-4 text-center font-serif text-[clamp(3rem,13.5vw,12.5rem)] font-medium leading-[0.85] tracking-[-0.04em] text-ink"
          aria-hidden
        >
          The Wire <span className="font-serif-italic">Desk</span>
        </p>

        <div className="mt-6 flex flex-col gap-2 border-t border-rule py-5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} The Wire Desk. All dispatches reserved.</span>
          <span>Printed on recycled pixels</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink">{title}</span>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-accent-dark">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
