"use client";

import { Countdown, useNow } from "@/components/live/Live";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import type { Platform } from "@/lib/types";

// Offsets are relative to page load so the demo queue is always "upcoming".
const QUEUE: { platform: Platform; title: string; inMin: number }[] = [
  { platform: "X", title: "Launch thread: dark mode is here", inMin: 7 },
  { platform: "LinkedIn", title: "What 400 feature requests taught us", inMin: 134 },
  { platform: "Instagram", title: "Behind the desk — Friday edition", inMin: 1510 },
];

let loadedAt = 0;

export function QueueDemo() {
  const now = useNow();
  if (!loadedAt && now) loadedAt = now;
  const base = loadedAt || now;

  return (
    <div className="overflow-hidden rounded-[10px] border border-paper/20 bg-ink text-paper">
      <div className="flex items-center justify-between border-b border-paper/15 px-4 py-2.5">
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-paper/60">
          Outbound queue
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-accent">
          <span className="live-dot" /> Live
        </span>
      </div>
      <ul className="divide-y divide-paper/10">
        {QUEUE.map((q) => (
          <li key={q.title} className="flex items-center gap-3 px-4 py-3">
            <PlatformIcon platform={q.platform} size="sm" />
            <span className="min-w-0 flex-1 truncate text-sm">{q.title}</span>
            <span className="font-mono text-xs text-paper/70">
              {base ? <Countdown to={base + q.inMin * 60_000} /> : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
