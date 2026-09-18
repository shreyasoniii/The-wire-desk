"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAllPosts, deletePost, ApiError } from "@/lib/api";
import type { Platform, Post, PostStatus } from "@/lib/types";
import { PLATFORMS } from "@/lib/types";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { formatDateTime } from "@/lib/format";

const STATUSES: PostStatus[] = ["draft", "scheduled", "published"];

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [status, setStatus] = useState<PostStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    getAllPosts()
      .then(({ data }) => setPosts(data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load posts"));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    let list = posts ?? [];
    if (platform !== "all") list = list.filter((p) => p.platform === platform);
    if (status !== "all") list = list.filter((p) => p.status === status);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.topic.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === "newest" ? -diff : diff;
    });
  }, [posts, platform, status, search, sort]);

  async function onDelete(id: string) {
    if (!confirm("Delete this post? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await deletePost(id);
      setPosts((prev) => prev?.filter((p) => p._id !== id) ?? null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <Topbar
        title="Posts"
        subtitle={`${posts?.length ?? 0} posts across all platforms`}
        action={
          <Link href="/posts/new">
            <Button>+ New Post</Button>
          </Link>
        }
      />

      <main className="p-6">
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts"
            className="w-56 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          <div className="flex overflow-hidden rounded-lg border border-border bg-white">
            <FilterPill active={platform === "all"} onClick={() => setPlatform("all")}>
              All platforms
            </FilterPill>
            {PLATFORMS.map((p) => (
              <FilterPill key={p} active={platform === p} onClick={() => setPlatform(p)}>
                {p}
              </FilterPill>
            ))}
          </div>

          <div className="flex overflow-hidden rounded-lg border border-border bg-white">
            <FilterPill active={status === "all"} onClick={() => setStatus("all")}>
              All statuses
            </FilterPill>
            {STATUSES.map((s) => (
              <FilterPill key={s} active={status === s} onClick={() => setStatus(s)}>
                {s[0].toUpperCase() + s.slice(1)}
              </FilterPill>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className="ml-auto rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-white">
          {posts === null ? (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">No posts match these filters.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Post</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((post) => (
                  <tr key={post._id} className="hover:bg-surface-muted">
                    <td className="px-5 py-3">
                      <Link href={`/posts/${post._id}`} className="flex items-center gap-3">
                        <PlatformIcon platform={post.platform} size="sm" />
                        <span className="max-w-md truncate text-ink">{post.topic}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {post.status === "published"
                        ? formatDateTime(post.publishedAt)
                        : post.status === "scheduled"
                        ? formatDateTime(post.scheduledAt)
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/posts/${post._id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-muted hover:bg-surface-muted"
                          aria-label="Edit post"
                        >
                          <PencilIcon />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(post._id)}
                          disabled={deletingId === post._id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-red-600 hover:bg-red-50 disabled:opacity-50"
                          aria-label="Delete post"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-ink text-white" : "text-ink-muted hover:bg-surface-muted"
      }`}
    >
      {children}
    </button>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M13.5 3.5l3 3L6 17H3v-3z" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M4 6h12M8 6V4h4v2M6 6l1 11h6l1-11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
