"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getSocialAccounts,
  disconnectSocialAccount,
  startOauthConnect,
  ApiError,
} from "@/lib/api";
import { PLATFORMS, type Platform, type SocialAccount } from "@/lib/types";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { formatDate } from "@/lib/format";

export default function SocialAccountsPage() {
  return (
    <Suspense fallback={null}>
      <SocialAccountsContent />
    </Suspense>
  );
}

type CallbackNotice = { type: "success" | "error"; text: string };

// Reads the OAuth redirect's query params (?linkedin=connected, ?x=error&reason=...)
// exactly once, from the URL the page first loaded with — before the effect
// below strips them back out with router.replace.
function readCallbackNotice(searchParams: URLSearchParams): CallbackNotice | null {
  for (const key of ["linkedin", "x", "instagram"] as const) {
    const value = searchParams.get(key);
    if (!value) continue;
    const label = key === "x" ? "X" : key[0].toUpperCase() + key.slice(1);
    if (value === "connected") {
      return { type: "success", text: `${label} connected successfully.` };
    }
    const reason = searchParams.get("reason");
    return { type: "error", text: `Couldn't connect ${label}${reason ? `: ${reason}` : "."}` };
  }
  return null;
}

function SocialAccountsContent() {
  const [accounts, setAccounts] = useState<SocialAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const [callbackNotice] = useState(() => readCallbackNotice(searchParams));

  function load() {
    getSocialAccounts()
      .then(({ data }) => setAccounts(data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load accounts"));
  }

  useEffect(load, []);

  useEffect(() => {
    if (!callbackNotice) return;
    if (callbackNotice.type === "success") load();
    router.replace("/social-accounts");
    // Only ever needs to run once, against the URL this page landed on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onConnect(platform: Platform) {
    setBusy(platform);
    try {
      await startOauthConnect(platform);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start the connection");
      setBusy(null);
    }
  }

  async function onDisconnect(account: SocialAccount) {
    if (!confirm(`Disconnect ${account.platform}?`)) return;
    setBusy(account._id);
    try {
      await disconnectSocialAccount(account._id);
      setAccounts((prev) => prev?.filter((a) => a._id !== account._id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't disconnect this account");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Topbar title="Social Accounts" subtitle="Connect the platforms you publish to" />

      <main className="p-6">
        {callbackNotice && (
          <p
            className={`mb-4 rounded-lg border px-4 py-2 text-sm ${
              callbackNotice.type === "success"
                ? "border-primary-light bg-primary-light text-primary-dark"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {callbackNotice.text}
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {PLATFORMS.map((platform) => {
            const account = accounts?.find((a) => a.platform === platform);
            return (
              <div key={platform} className="rounded-xl border border-border bg-white p-5">
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={platform} size="lg" />
                  <div>
                    <p className="font-semibold text-ink">{platform}</p>
                    <p className={`text-xs font-medium ${account ? "text-primary-dark" : "text-ink-muted"}`}>
                      {account ? "● Connected" : "○ Not connected"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-4">
                  {account ? (
                    <>
                      <p className="text-sm text-ink">as {account.username}</p>
                      <p className="text-xs text-ink-muted">Connected {formatDate(account.createdAt)}</p>
                      <Button
                        variant="outline"
                        className="mt-3 w-full"
                        onClick={() => onDisconnect(account)}
                        loading={busy === account._id}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-ink-muted">Connect to publish and schedule posts here.</p>
                      <Button
                        variant="primary"
                        className="mt-3 w-full"
                        onClick={() => onConnect(platform)}
                        loading={busy === platform}
                      >
                        Connect
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-primary-light bg-primary-light/40 p-5">
          <div>
            <p className="font-semibold text-ink">Need a hand connecting an account?</p>
            <p className="text-sm text-ink-muted">OAuth connections use read + publish scopes only — never your password.</p>
          </div>
        </div>
      </main>
    </>
  );
}
