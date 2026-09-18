"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getPostById,
  updatePost,
  deletePost,
  schedulePost,
  publishPost,
  ApiError,
} from "@/lib/api";
import type { Post } from "@/lib/types";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Label, Textarea, Toggle } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/Badge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { formatDateTime } from "@/lib/format";

export function PostEditor({ id }: { id: string }) {
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [autoRegenerate, setAutoRegenerate] = useState(false);

  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    getPostById(id)
      .then(({ data }) => {
        setPost(data);
        setContent(data.content);
        setMediaUrl(data.mediaUrl ?? "");
        setAutoRegenerate(data.autoRegenerate);
        if (data.scheduledAt) {
          const d = new Date(data.scheduledAt);
          setScheduledDate(d.toISOString().slice(0, 10));
          setScheduledTime(d.toISOString().slice(11, 16));
        }
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Couldn't load this post"));
  }, [id]);

  const activity = useMemo(() => {
    if (!post) return [];
    const items: { label: string; at: string; tone?: "error" }[] = [];
    if (post.status === "published") {
      items.push({
        label: post.postedToRealPlatform
          ? `Published to ${post.platform}`
          : `Publish to ${post.platform} attempt failed`,
        at: post.publishedAt ?? post.updatedAt,
        tone: post.postedToRealPlatform ? undefined : "error",
      });
    }
    if (post.updatedAt !== post.createdAt) {
      items.push({ label: "Content last updated", at: post.updatedAt });
    }
    items.push({
      label: post.usedFallback ? "Created from template content" : "Generated with AI",
      at: post.createdAt,
    });
    return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [post]);

  async function saveChanges() {
    if (!post) return;
    setActionError(null);
    setSaving(true);
    try {
      const { data } = await updatePost(post._id, { content, mediaUrl: mediaUrl || undefined });
      setPost(data);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't save changes");
    } finally {
      setSaving(false);
    }
  }

  async function retryPublish() {
    if (!post) return;
    setActionError(null);
    setRetrying(true);
    try {
      const { data } = await publishPost(post._id, { mediaUrl: mediaUrl || undefined });
      setPost(data);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't publish this post");
    } finally {
      setRetrying(false);
    }
  }

  async function saveSchedule() {
    if (!post || !scheduledDate || !scheduledTime) return;
    setActionError(null);
    setSavingSchedule(true);
    try {
      const iso = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      const { data } = await schedulePost(post._id, { scheduledAt: iso, autoRegenerate });
      setPost(data);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't update the schedule");
    } finally {
      setSavingSchedule(false);
    }
  }

  async function onDelete() {
    if (!post || !confirm("Delete this post? This can't be undone.")) return;
    setDeleting(true);
    try {
      await deletePost(post._id);
      router.push("/posts");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't delete this post");
      setDeleting(false);
    }
  }

  if (loadError) {
    return (
      <>
        <Topbar title="Edit post" subtitle="Posts / Edit" />
        <main className="p-6">
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </p>
          <Link href="/posts" className="mt-3 inline-block text-sm font-medium text-primary">
            ← Back to posts
          </Link>
        </main>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Topbar title="Edit post" subtitle="Posts / Edit" />
        <main className="p-6">
          <p className="text-sm text-ink-muted">Loading…</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Edit post"
        subtitle="Posts / Edit"
        action={
          <Link href="/posts" className="text-sm font-medium text-ink-muted hover:text-ink">
            ← Back to posts
          </Link>
        }
      />

      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-semibold text-ink">{post.topic}</h2>
          <StatusBadge status={post.status} />
          <PlatformIcon platform={post.platform} size="sm" />
        </div>

        {post.status === "published" && !post.postedToRealPlatform && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700">Not live on {post.platform}</p>
            <p className="mt-1 text-sm text-red-600">
              {post.externalPostError ??
                "postedToRealPlatform is false — the last publish attempt didn't reach the platform."}
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" onClick={retryPublish} loading={retrying}>
                Retry publish
              </Button>
              <Link href="/social-accounts">
                <Button variant="ghost">Reconnect {post.platform}</Button>
              </Link>
            </div>
          </div>
        )}

        {actionError && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {actionError}
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-white p-5">
              <Label>Content</Label>
              <Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} />

              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4 text-xs">
                <div>
                  <p className="uppercase tracking-wide text-ink-muted">Tone</p>
                  <p className="mt-0.5 text-ink">{post.tone}</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-ink-muted">Audience</p>
                  <p className="mt-0.5 text-ink">{post.audience}</p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-ink-muted">Platform</p>
                  <p className="mt-0.5 text-ink">{post.platform}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-5">
              <Label>Media URL</Label>
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Paste an image or video URL"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-white p-5">
              <h3 className="mb-3 font-semibold text-ink">Scheduling</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">Auto-regenerate before publish</p>
                  <p className="text-xs text-ink-muted">Refreshes with a new AI variant, using 1 credit.</p>
                </div>
                <Toggle checked={autoRegenerate} onChange={setAutoRegenerate} />
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={saveSchedule}
                loading={savingSchedule}
                disabled={!scheduledDate || !scheduledTime}
              >
                Save schedule
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-white p-5">
              <h3 className="mb-3 font-semibold text-ink">Activity</h3>
              <ul className="space-y-3">
                {activity.map((item, i) => (
                  <li key={i} className="text-sm">
                    <p className={item.tone === "error" ? "text-red-600" : "text-ink"}>{item.label}</p>
                    <p className="text-xs text-ink-muted">{formatDateTime(item.at)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <Button variant="danger" onClick={onDelete} loading={deleting}>
            Delete post
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveChanges} loading={saving}>
              Save changes
            </Button>
            <Button onClick={retryPublish} loading={retrying}>
              {post.status === "published" ? "Republish" : "Publish now"}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
