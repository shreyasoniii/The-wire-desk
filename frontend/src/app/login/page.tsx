"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Panel";
import { Logo } from "@/components/layout/Logo";
import { LiveClock } from "@/components/live/Live";

const PaperPlanes = dynamic(() => import("@/components/three/PaperPlanes"), { ssr: false });

type Tab = "signin" | "signup";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(() =>
    searchParams.get("tab") === "signup" ? "signup" : "signin"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (tab === "signin") {
        await login(email, password, remember);
      } else {
        await register(name, email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen flex-1 bg-paper lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Press room */}
      <aside className="relative hidden overflow-hidden bg-ink text-paper lg:flex lg:flex-col">
        <div
          className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(var(--paper)_1px,transparent_1px),linear-gradient(90deg,var(--paper)_1px,transparent_1px)] [background-size:44px_44px]"
          aria-hidden
        />
        <div className="relative flex items-center justify-between px-10 pt-8">
          <Logo tone="paper" />
          <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-paper/60">
            <span className="live-dot text-accent" /> <LiveClock />
          </span>
        </div>

        <div className="relative flex-1" aria-hidden>
          <PaperPlanes />
        </div>

        <div className="relative px-10 pb-10">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent">From the desk</p>
          <blockquote className="mt-3 max-w-md font-serif text-3xl leading-[1.1]">
            &ldquo;Say it once, <span className="font-serif-italic text-[#9fd1ad]">say it well</span>, and let
            the wire carry it.&rdquo;
          </blockquote>
          <div className="mt-8 flex gap-8 border-t border-paper/15 pt-5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-paper/60">
            <span>LinkedIn</span>
            <span>X</span>
            <span>Instagram</span>
          </div>
        </div>
      </aside>

      {/* Form */}
      <div className="paper-grain flex flex-col px-4 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link href="/" className="ml-auto text-sm font-medium text-ink-muted transition-colors hover:text-ink">
            ← Back to home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
          <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-accent-dark">
            {tab === "signin" ? "Returning correspondent" : "New correspondent"}
          </p>
          <h1 key={tab} className="animate-rise mt-2 font-serif text-5xl leading-[1] text-ink">
            {tab === "signin" ? (
              <>
                Welcome back <span className="font-serif-italic">to the desk.</span>
              </>
            ) : (
              <>
                Open your <span className="font-serif-italic">newsroom.</span>
              </>
            )}
          </h1>

          <div className="relative mt-8 grid grid-cols-2 rounded-[8px] border border-ink p-1" role="tablist">
            <span
              className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-[5px] bg-ink transition-transform duration-300 ease-out ${
                tab === "signup" ? "translate-x-full" : ""
              }`}
              aria-hidden
            />
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => {
                  setTab(t);
                  setError(null);
                }}
                className={`relative z-10 rounded-[5px] py-2 text-sm font-semibold transition-colors ${
                  tab === t ? "text-paper" : "text-ink-muted hover:text-ink"
                }`}
              >
                {t === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {error && (
            <Alert className="mt-5" title={tab === "signin" ? "Invalid email or password" : "Couldn't create account"}>
              {error}
            </Alert>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {tab === "signup" && (
              <div className="animate-rise">
                <Label>Full name</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
              </div>
            )}

            <div>
              <Label>Email address</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@newsroom.com"
                autoComplete="email"
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
              />
            </div>

            {tab === "signin" && (
              <label className="flex items-center gap-2 text-sm text-ink-muted">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-rule-strong accent-[var(--color-primary)]"
                />
                Remember me
              </label>
            )}

            <Button type="submit" className="w-full py-3 text-[15px]" loading={submitting}>
              {submitting
                ? tab === "signin"
                  ? "Signing in…"
                  : "Creating account…"
                : tab === "signin"
                ? "Sign in"
                : "Create account"}
              {!submitting && <span aria-hidden>→</span>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            {tab === "signin" ? (
              <>
                New to The Wire Desk?{" "}
                <button type="button" onClick={() => setTab("signup")} className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("signin")} className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted">
          © {new Date().getFullYear()} The Wire Desk · A newsroom for every feed
        </p>
      </div>
    </div>
  );
}
