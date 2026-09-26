"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// One shared 1s ticker for every live component on the page.
const listeners = new Set<() => void>();
let tickTimer: ReturnType<typeof setInterval> | null = null;
let nowValue = 0;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!tickTimer) {
    nowValue = Date.now();
    tickTimer = setInterval(() => {
      nowValue = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  };
}

/** Current time, updated every second. Returns 0 during SSR. */
export function useNow() {
  return useSyncExternalStore(
    subscribe,
    () => nowValue || Date.now(),
    () => 0
  );
}

export function LiveClock({
  timeZone,
  label,
  className = "",
}: {
  timeZone?: string;
  label?: string;
  className?: string;
}) {
  const now = useNow();
  const text = now
    ? new Date(now).toLocaleTimeString("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";
  return (
    <span className={`tabular-nums ${className}`}>
      {label && <span className="opacity-60">{label} </span>}
      {text}
    </span>
  );
}

function splitDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

export function Countdown({ to, className = "" }: { to: string | number; className?: string }) {
  const now = useNow();
  const target = typeof to === "number" ? to : new Date(to).getTime();
  if (!now) return <span className={className}>—</span>;
  const diff = target - now;
  if (diff <= 0) return <span className={className}>filing now</span>;
  const { d, h, m, s } = splitDuration(diff);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className={`tabular-nums ${className}`}>
      {d > 0 && `${d}d `}
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

/** Animates from 0 (or the previous value) to `value` once it's on screen. */
export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const run = () => {
      const from = fromRef.current;
      if (reduce || from === value) {
        setDisplay(value);
        fromRef.current = value;
        return;
      }
      const start = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(from + (value - from) * eased));
        if (p < 1) raf = requestAnimationFrame(step);
        else fromRef.current = value;
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        run();
        io.disconnect();
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}

/** Tiny bar sparkline; the last bar is highlighted as "today". */
export function Sparkline({
  values,
  labels,
  className = "",
}: {
  values: number[];
  labels?: string[];
  className?: string;
}) {
  const max = Math.max(1, ...values);
  return (
    <div className={`flex h-14 items-end gap-[3px] ${className}`} role="img" aria-label={`Activity: ${values.join(", ")}`}>
      {values.map((v, i) => {
        const last = i === values.length - 1;
        return (
          <div key={i} className="group relative flex h-full flex-1 items-end">
            <div
              className={`w-full origin-bottom rounded-t-[2px] transition-[height] duration-700 ${
                last ? "bg-accent" : v > 0 ? "bg-ink/80 group-hover:bg-primary" : "bg-rule"
              }`}
              style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
            />
            {labels && (
              <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-ink px-1.5 py-0.5 font-mono text-[10px] text-paper group-hover:block">
                {labels[i]} · {v}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
