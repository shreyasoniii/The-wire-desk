"use client";

import { useEffect, useRef, useState } from "react";
import { PLATFORMS, TONES, type Platform } from "@/lib/types";
import { PLATFORM_LIMITS, PlatformIcon } from "@/components/ui/PlatformIcon";

const SAMPLE_TOPICS = [
  "We cut our onboarding from 9 steps to 3",
  "Why we stopped posting every day",
  "Launching dark mode after 400 requests",
];

// Client-side sample copy so visitors can feel the flow without an account.
function sampleVariants(topic: string, tone: string): string[] {
  const t = topic.trim().replace(/\.$/, "") || SAMPLE_TOPICS[0];
  const bold = tone.startsWith("Bold");
  const warm = tone.startsWith("Warm") || tone.startsWith("Friendly");
  return [
    `${t}.\n\nHere's what changed, what broke along the way, and the one number that convinced us it was worth it. Thread below — and yes, we kept the receipts.`,
    bold
      ? `Unpopular opinion: most teams never get here. ${t} — and it took us deleting more than we built.\n\nThe short version? Less, but louder.`
      : warm
      ? `A small story from our week: ${t.charAt(0).toLowerCase() + t.slice(1)}.\n\nNothing flashy — just a lot of listening. Thank you to everyone who told us what wasn't working.`
      : `${t}. Three lessons we'd hand to anyone attempting the same:\n\n1. Measure the before.\n2. Cut in public.\n3. Ship the boring version first.`,
    `If you only read one thing from us this month: ${t.charAt(0).toLowerCase() + t.slice(1)}.\n\nFull write-up on the blog. Questions welcome — we answer every reply.`,
  ];
}

function useTypewriter(target: string, run: number, speed = 9) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!run) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setOut(target);
      return;
    }
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setOut(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [target, run, speed]);
  return out;
}

export function ComposerDemo() {
  const [topic, setTopic] = useState(SAMPLE_TOPICS[0]);
  const [tone, setTone] = useState<string>(TONES[0]);
  const [run, setRun] = useState(0);
  const [picked, setPicked] = useState(0);
  const [variants, setVariants] = useState(() => sampleVariants(SAMPLE_TOPICS[0], TONES[0]));
  const [wiring, setWiring] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function wire() {
    setWiring(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setVariants(sampleVariants(topic, tone));
      setPicked(0);
      setRun((r) => r + 1);
      setWiring(false);
    }, 650);
  }

  return (
    <div className="grid overflow-hidden rounded-[12px] border border-ink bg-card shadow-[8px_8px_0_var(--color-ink)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Brief */}
      <div className="border-b border-ink p-6 lg:border-b-0 lg:border-r">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-accent-dark">
          The brief
        </p>
        <label htmlFor="demo-topic" className="mt-4 block font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
          Topic
        </label>
        <textarea
          id="demo-topic"
          rows={3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-1.5 w-full resize-none rounded-[6px] border border-rule-strong bg-white/70 px-3 py-2 font-serif text-lg leading-snug text-ink focus:border-ink focus:bg-white focus:outline-none"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SAMPLE_TOPICS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTopic(s)}
              className="rounded-full border border-rule-strong px-2.5 py-0.5 text-xs text-ink-muted transition-colors hover:border-ink hover:text-ink"
            >
              {s.length > 28 ? s.slice(0, 28) + "…" : s}
            </button>
          ))}
        </div>

        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">Tone</p>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              aria-pressed={tone === t}
              className={`rounded-[6px] border px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                tone === t ? "border-ink bg-ink text-paper" : "border-rule-strong text-ink-muted hover:border-ink hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={wire}
          disabled={wiring}
          className="mt-6 flex w-full items-center justify-between rounded-[6px] bg-accent px-4 py-3 text-sm font-semibold text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-accent-dark disabled:opacity-70"
        >
          {wiring ? "Running the wire…" : "Run the wire"}
          <span className="font-mono text-xs opacity-80">↵ 3 variants</span>
        </button>
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
          Demo · sample copy · no credits used
        </p>
      </div>

      {/* Output */}
      <div className="flex min-w-0 flex-col bg-paper/60">
        <div className="flex border-b border-ink" role="tablist" aria-label="Variants">
          {variants.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={picked === i}
              onClick={() => setPicked(i)}
              className={`flex-1 border-r border-ink px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.12em] last:border-r-0 ${
                picked === i ? "bg-ink text-paper" : "text-ink-muted hover:bg-paper-deep"
              }`}
            >
              Variant {"ABC"[i]}
            </button>
          ))}
        </div>
        <VariantBody key={`${run}-${picked}`} text={variants[picked]} run={run} wiring={wiring} />
      </div>
    </div>
  );
}

function VariantBody({ text, run, wiring }: { text: string; run: number; wiring: boolean }) {
  const typed = useTypewriter(text, run || 1);
  const shown = run ? typed : text;
  const done = shown.length >= text.length;

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className={`min-h-[180px] flex-1 transition-opacity ${wiring ? "opacity-30" : ""}`}>
        <p className={`whitespace-pre-line text-[15px] leading-relaxed text-ink ${done ? "" : "caret"}`}>{shown}</p>
      </div>
      <div className="mt-6 space-y-2.5 border-t border-rule pt-4">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Platform fit · live
        </p>
        {PLATFORMS.map((p) => (
          <FitMeter key={p} platform={p} length={shown.length} />
        ))}
      </div>
    </div>
  );
}

export function FitMeter({ platform, length }: { platform: Platform; length: number }) {
  const limit = PLATFORM_LIMITS[platform];
  const pct = Math.min(100, (length / limit) * 100);
  const over = length > limit;
  return (
    <div className="flex items-center gap-3">
      <PlatformIcon platform={platform} size="sm" />
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-paper-deep">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-200 ${
            over ? "bg-red-600" : pct > 80 ? "bg-accent" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`w-20 text-right font-mono text-[11px] tabular-nums ${over ? "text-red-700" : "text-ink-muted"}`}>
        {length}/{limit}
      </span>
    </div>
  );
}
