"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Logo } from "@/components/layout/Logo";

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
    <div className="flex flex-1 flex-col items-center justify-center bg-surface-muted px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-4 inline-block text-sm font-medium text-ink-muted hover:text-ink"
        >
          ← Back to home
        </Link>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <Logo />
          <p className="mt-1 text-sm text-ink-muted">
            {tab === "signin" ? "Sign in to your newsroom" : "Create your newsroom account"}
          </p>
        </div>

        <div className="mt-6 flex rounded-lg border border-border bg-surface-muted p-1">
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError(null);
              }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                tab === t ? "bg-white text-ink shadow-sm" : "text-ink-muted"
              }`}
            >
              {t === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-5 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <span className="mt-0.5">⚠</span>
            <div>
              <p className="font-semibold">
                {tab === "signin" ? "Invalid email or password" : "Couldn't create account"}
              </p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {tab === "signup" && (
            <div>
              <Label>Full name</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
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
            />
          </div>

          {tab === "signin" && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-ink-muted">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                />
                Remember me
              </label>
            </div>
          )}

          <Button type="submit" className="w-full" loading={submitting}>
            {submitting
              ? tab === "signin"
                ? "Signing in…"
                : "Creating account…"
              : tab === "signin"
              ? "Sign in"
              : "Create account"}
          </Button>
        </form>

        <div className="mt-5 flex items-center gap-3 text-xs text-ink-muted">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <p className="mt-4 text-center text-sm text-ink-muted">
          {tab === "signin" ? (
            <>
              New to The Wire Desk?{" "}
              <button
                type="button"
                onClick={() => setTab("signup")}
                className="font-medium text-primary hover:text-primary-dark"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("signin")}
                className="font-medium text-primary hover:text-primary-dark"
              >
                Sign in
              </button>
            </>
          )}
        </p>
        </div>
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        © {new Date().getFullYear()} The Wire Desk · A newsroom for every feed
      </p>
    </div>
  );
}
