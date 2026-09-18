"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getAllPosts, getSocialAccounts, ApiError } from "@/lib/api";
import type { Post, SocialAccount } from "@/lib/types";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { formatDateTime } from "@/lib/format";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [accounts, setAccounts] = useState<SocialAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAllPosts(), getSocialAccounts()])
      .then(([p, a]) => {
        setPosts(p.data);
        setAccounts(a.data);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard")
      );
  }, []);

  const drafts = useMemo(() => posts?.filter((p) => p.status === "draft") ?? [], [posts]);
  const scheduled = useMemo(
    () =>
      (posts?.filter((p) => p.status === "scheduled") ?? []).sort(
        (a, b) => new Date(a.scheduledAt ?? 0).getTime() - new Date(b.scheduledAt ?? 0).getTime()
      ),
    [posts]
  );
  const publishedThisMonth = useMemo(() => {
    const now = new Date();
    return (posts ?? []).filter(
      (p) =>
        p.status === "published" &&
        p.publishedAt &&
        new Date(p.publishedAt).getMonth() === now.getMonth() &&
        new Date(p.publishedAt).getFullYear() === now.getFullYear()
    );
  }, [posts]);

  const [now] = useState(() => Date.now());
  const upcomingThisWeek = useMemo(() => {
    const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;
    return scheduled.filter(
      (p) => p.scheduledAt && new Date(p.scheduledAt).getTime() <= weekFromNow
    );
  }, [scheduled, now]);

  const recentPosts = useMemo(() => (posts ?? []).slice(0, 6), [posts]);

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Your newsroom at a glance"
        action={
          <Link href="/posts/new">
            <Button>
              <PlusIcon /> New Post
            </Button>
          </Link>
        }
      />

      <main className="p-6">
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-ink">
              {greeting()}, {user?.name?.split(" ")[0] ?? ""}
            </h2>
            <p className="text-sm text-ink-muted">Here&apos;s what&apos;s moving on the wire today.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Drafts"
                value={drafts.length}
                hint={
                  drafts.length
                    ? `${drafts.filter((d) => !d.mediaUrl).length} need media`
                    : "No drafts yet"
                }
                icon={<DocStatIcon />}
                tone="muted"
              />
              <StatCard
                label="Scheduled"
                value={scheduled.length}
                hint={
                  scheduled[0]?.scheduledAt
                    ? `Next: ${formatDateTime(scheduled[0].scheduledAt)}`
                    : "Nothing scheduled"
                }
                icon={<ClockStatIcon />}
                tone="accent"
              />
              <StatCard
                label="Published this month"
                value={publishedThisMonth.length}
                hint="In-app publish log"
                icon={<CheckStatIcon />}
                tone="primary"
              />
            </div>

            <div className="mt-4 rounded-xl border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h3 className="font-semibold text-ink">Recent posts</h3>
                <Link href="/posts" className="text-sm font-medium text-primary hover:text-primary-dark">
                  View all
                </Link>
              </div>

              {posts === null ? (
                <p className="px-5 py-8 text-center text-sm text-ink-muted">Loading…</p>
              ) : recentPosts.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-ink-muted">
                  No posts yet — create your first one.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {recentPosts.map((post) => (
                    <li key={post._id}>
                      <Link
                        href={`/posts/${post._id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-surface-muted"
                      >
                        <PlatformIcon platform={post.platform} size="sm" />
                        <span className="min-w-0 flex-1 truncate text-sm text-ink">{post.topic}</span>
                        <StatusBadge status={post.status} />
                        <span className="w-24 shrink-0 text-right text-xs text-ink-muted">
                          {post.status === "published"
                            ? formatDateTime(post.publishedAt)
                            : post.status === "scheduled"
                            ? formatDateTime(post.scheduledAt)
                            : "—"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-white p-5">
              <h3 className="mb-3 font-semibold text-ink">Upcoming this week</h3>
              {upcomingThisWeek.length === 0 ? (
                <p className="text-sm text-ink-muted">Nothing scheduled in the next 7 days.</p>
              ) : (
                <ul className="space-y-3">
                  {upcomingThisWeek.slice(0, 5).map((post) => (
                    <li key={post._id} className="flex items-start gap-2 text-sm">
                      <PlatformIcon platform={post.platform} size="sm" />
                      <span className="min-w-0 flex-1 truncate text-ink">{post.topic}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-border bg-white p-5">
              <h3 className="mb-3 font-semibold text-ink">Connected accounts</h3>
              {accounts === null ? (
                <p className="text-sm text-ink-muted">Loading…</p>
              ) : accounts.length === 0 ? (
                <p className="text-sm text-ink-muted">No accounts connected yet.</p>
              ) : (
                <ul className="space-y-3">
                  {accounts.map((acc) => (
                    <li key={acc._id} className="flex items-center gap-2 text-sm text-ink">
                      <PlatformIcon platform={acc.platform} size="sm" />
                      {acc.platform}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/social-accounts"
                className="mt-3 block text-sm font-medium text-primary hover:text-primary-dark"
              >
                Manage accounts
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  tone: "muted" | "accent" | "primary";
}) {
  const toneStyles = {
    muted: "bg-surface-muted text-ink-muted",
    accent: "bg-accent-light text-accent-dark",
    primary: "bg-primary-light text-primary-dark",
  }[tone];

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-muted">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneStyles}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{hint}</p>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
    </svg>
  );
}
function DocStatIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M5 2.5h7l3 3v12h-10z" strokeLinejoin="round" />
    </svg>
  );
}
function ClockStatIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 6v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckStatIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
