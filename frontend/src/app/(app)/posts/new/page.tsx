"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  generateAiPost,
  createPost,
  schedulePost,
  publishPost,
  ApiError,
} from "@/lib/api";
import { AUDIENCES, PLATFORMS, TONES, type Platform } from "@/lib/types";
import { splitVariants } from "@/lib/format";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Label, Select, Textarea, Toggle } from "@/components/ui/Field";
import { PlatformChip } from "@/components/ui/PlatformIcon";

const VARIANT_LABELS = ["A", "B", "C"] as const;

export default function NewPostPage() {
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>(["LinkedIn"]);
  const [tone, setTone] = useState<string>(TONES[0]);
  const [audience, setAudience] = useState<string>(AUDIENCES[0]);

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [variants, setVariants] = useState<string[] | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  const [scheduling, setScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [autoRegenerate, setAutoRegenerate] = useState(false);

  const [submitting, setSubmitting] = useState<"draft" | "schedule" | "publish" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const needsMedia = platforms.includes("Instagram") && !mediaUrl.trim();

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function onGenerate() {
    if (!topic.trim() || platforms.length === 0) {
      setGenError("Add a topic and pick at least one platform first.");
      return;
    }
    setGenError(null);
    setGenerating(true);
    try {
      const res = await generateAiPost({
        topic,
        platform: platforms[0],
        tone,
        audience,
      });
      const parsed = splitVariants(res.data);
      setVariants(parsed);
      setUsedFallback(res.usedFallback);
      setSelectedVariant(0);
      setContent(parsed[0] ?? "");
      setShowEditor(true);
    } catch (err) {
      setGenError(err instanceof ApiError ? err.message : "Couldn't generate content");
    } finally {
      setGenerating(false);
    }
  }

  function pickVariant(i: number) {
    setSelectedVariant(i);
    setContent(variants?.[i] ?? "");
  }

  function writeManually() {
    setVariants(null);
    setSelectedVariant(null);
    setShowEditor(true);
  }

  const scheduledAtIso = useMemo(() => {
    if (!scheduledDate || !scheduledTime) return null;
    const d = new Date(`${scheduledDate}T${scheduledTime}`);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }, [scheduledDate, scheduledTime]);

  async function submit(action: "draft" | "schedule" | "publish") {
    setFormError(null);

    if (!topic.trim() || platforms.length === 0 || !content.trim()) {
      setFormError("Add a topic, at least one platform, and post content first.");
      return;
    }
    if (action !== "draft" && needsMedia) {
      setFormError("Instagram posts need media attached before scheduling or publishing.");
      return;
    }
    if (action === "schedule" && !scheduledAtIso) {
      setFormError("Pick a valid date and time to schedule this post.");
      return;
    }

    setSubmitting(action);
    try {
      const created = await Promise.all(
        platforms.map((platform) =>
          createPost({ topic, platform, tone, audience, content, mediaUrl: mediaUrl || undefined })
        )
      );

      if (action === "schedule" && scheduledAtIso) {
        await Promise.all(
          created.map((c) =>
            schedulePost(c.data._id, { scheduledAt: scheduledAtIso, autoRegenerate })
          )
        );
      } else if (action === "publish") {
        await Promise.all(created.map((c) => publishPost(c.data._id, { mediaUrl: mediaUrl || undefined })));
      }

      router.push("/posts");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't save this post");
      setSubmitting(null);
    }
  }

  return (
    <>
      <Topbar title="New Post" subtitle="Draft once, publish everywhere" />

      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <Section step={1} title="What's the story?">
          <div className="space-y-4">
            <div>
              <Label>Topic</Label>
              <Textarea
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What are you writing about?"
              />
            </div>

            <div>
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <PlatformChip
                    key={p}
                    platform={p}
                    selected={platforms.includes(p)}
                    onClick={() => togglePlatform(p)}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Tone</Label>
                <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                  {TONES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Audience</Label>
                <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
                  {AUDIENCES.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {genError && <p className="mt-3 text-sm text-red-600">{genError}</p>}

          <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-muted px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink">Ready to draft three variants?</p>
              <p className="text-xs text-ink-muted">Uses 1 AI credit per generation</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={writeManually} type="button">
                Write manually
              </Button>
              <Button variant="accent" onClick={onGenerate} loading={generating} type="button">
                <SparkleIcon /> Generate
              </Button>
            </div>
          </div>
        </Section>

        {variants && (
          <Section step={2} title="Choose a variant">
            <div className="grid gap-3 sm:grid-cols-3">
              {variants.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickVariant(i)}
                  className={`rounded-xl border p-4 text-left text-sm transition-colors ${
                    selectedVariant === i
                      ? "border-primary bg-primary-light"
                      : "border-border bg-white hover:border-primary/40"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Variant {VARIANT_LABELS[i]}
                    </span>
                    {selectedVariant === i && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-line text-ink-muted">{v}</p>
                </button>
              ))}
            </div>
            {usedFallback && (
              <p className="mt-3 flex items-center gap-1 text-xs text-accent-dark">
                <WarningIcon /> Template content · AI credits exhausted this cycle
              </p>
            )}
          </Section>
        )}

        {showEditor && (
          <Section step={3} title="Edit & attach media">
            <div className="space-y-4">
              <div>
                <Label>Edit your post</Label>
                <Textarea
                  rows={5}
                  maxLength={700}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post..."
                />
                <p className="mt-1 text-right text-xs text-ink-muted">{content.length} / 700</p>
              </div>

              <div>
                <Label>
                  Media {platforms.includes("Instagram") && (
                    <span className="ml-1 text-xs font-normal text-accent-dark">Required for Instagram</span>
                  )}
                </Label>
                <input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Paste an image or video URL"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">Schedule instead of publishing now</p>
                  <p className="text-xs text-ink-muted">Pick a date and time to auto-publish this post.</p>
                </div>
                <Toggle checked={scheduling} onChange={setScheduling} />
              </div>

              {scheduling && (
                <div className="grid gap-4 rounded-lg bg-surface-muted p-4 sm:grid-cols-2">
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
                  <div className="col-span-full flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">Auto-regenerate before publish</p>
                      <p className="text-xs text-ink-muted">
                        Refreshes the draft with a new AI variant right before it goes out, using 1 credit.
                      </p>
                    </div>
                    <Toggle checked={autoRegenerate} onChange={setAutoRegenerate} />
                  </div>
                </div>
              )}
            </div>

            {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => submit("draft")} loading={submitting === "draft"}>
                Save as Draft
              </Button>
              {scheduling ? (
                <Button onClick={() => submit("schedule")} loading={submitting === "schedule"}>
                  Schedule
                </Button>
              ) : (
                <Button onClick={() => submit("publish")} loading={submitting === "publish"}>
                  Publish Now
                </Button>
              )}
            </div>
          </Section>
        )}
      </main>
    </>
  );
}

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
          {step}
        </span>
        <h2 className="font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10 2l1.6 4.7L16.5 8l-4.9 1.3L10 14l-1.6-4.7L3.5 8l4.9-1.3L10 2z" />
    </svg>
  );
}
function WarningIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M10 2L2 17h16L10 2zm0 5v5m0 2.5h.01" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
