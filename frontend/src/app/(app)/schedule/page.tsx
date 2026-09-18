"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAllPosts, ApiError } from "@/lib/api";
import type { Post } from "@/lib/types";
import { Topbar } from "@/components/layout/Topbar";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { formatTime } from "@/lib/format";

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function SchedulePage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"week" | "list">("week");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  useEffect(() => {
    getAllPosts()
      .then(({ data }) => setPosts(data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load schedule"));
  }, []);

  const scheduled = useMemo(
    () =>
      (posts ?? [])
        .filter((p) => !!p.scheduledAt)
        .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()),
    [posts]
  );

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dayPosts = scheduled.filter((p) => {
        const at = new Date(p.scheduledAt!);
        return (
          at.getFullYear() === date.getFullYear() &&
          at.getMonth() === date.getMonth() &&
          at.getDate() === date.getDate()
        );
      });
      return { date, posts: dayPosts };
    });
  }, [weekStart, scheduled]);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  // Some locales (e.g. en-GB) render a bare { day, year } skeleton as an
  // odd disambiguated string (e.g. "2026 (day: 20)") since there's no
  // natural "year + day, no month" pattern — always include month instead.
  const monthDay = (d: Date) => d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  const weekLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${monthDay(weekStart)} – ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
      : `${monthDay(weekStart)} – ${monthDay(weekEnd)}, ${weekEnd.getFullYear()}`;

  return (
    <>
      <Topbar
        title="Schedule"
        subtitle={`Week of ${weekLabel}`}
        action={
          <div className="flex overflow-hidden rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setView("week")}
              className={`px-3 py-1.5 text-sm font-medium ${view === "week" ? "bg-ink text-white" : "text-ink-muted"}`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-sm font-medium ${view === "list" ? "bg-ink text-white" : "text-ink-muted"}`}
            >
              List
            </button>
          </div>
        }
      />

      <main className="p-6">
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {view === "week" && (
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-white"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-white"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted hover:bg-white"
            >
              Next →
            </button>
          </div>
        )}

        {posts === null ? (
          <p className="text-sm text-ink-muted">Loading…</p>
        ) : view === "week" ? (
          <div className="grid grid-cols-7 gap-3 overflow-x-auto">
            {days.map(({ date, posts: dayPosts }, i) => {
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <div
                  key={i}
                  className={`min-w-[9rem] rounded-xl border p-3 ${isToday ? "border-primary bg-primary-light/40" : "border-border bg-white"}`}
                >
                  <p className="text-xs font-semibold tracking-wide text-ink-muted">{DAY_LABELS[i]}</p>
                  <p className="mb-2 text-lg font-semibold text-ink">{date.getDate()}</p>
                  {dayPosts.length === 0 ? (
                    <p className="text-xs text-ink-muted">No posts</p>
                  ) : (
                    <div className="space-y-2">
                      {dayPosts.map((p) => (
                        <Link
                          key={p._id}
                          href={`/posts/${p._id}`}
                          className="block rounded-lg border border-border bg-surface-muted p-2 text-xs hover:border-primary/40"
                        >
                          <div className="mb-1 flex items-center gap-1.5">
                            <PlatformIcon platform={p.platform} size="sm" />
                            <span className="font-medium text-ink">{formatTime(p.scheduledAt)}</span>
                          </div>
                          <p className="line-clamp-3 text-ink-muted">{p.topic}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : scheduled.length === 0 ? (
          <p className="text-sm text-ink-muted">Nothing scheduled yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <ul className="divide-y divide-border">
              {scheduled.map((p) => (
                <li key={p._id}>
                  <Link href={`/posts/${p._id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-muted">
                    <PlatformIcon platform={p.platform} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">{p.topic}</span>
                    <span className="text-xs text-ink-muted">
                      {new Date(p.scheduledAt!).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </>
  );
}
