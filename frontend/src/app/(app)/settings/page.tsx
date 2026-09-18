"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateProfile, getCredits, ApiError } from "@/lib/api";
import type { AuthUser, Credits } from "@/lib/types";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [credits, setCredits] = useState<Credits | null>(null);

  useEffect(() => {
    getCredits()
      .then(({ data }) => setCredits(data))
      .catch(() => setCredits(null));
  }, []);

  return (
    <>
      <Topbar title="Settings" subtitle="Manage your profile, security and plan" />

      <main className="grid gap-4 p-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {user && <ProfileForm key={user.id} user={user} onSaved={refreshProfile} />}
          <PasswordForm />
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink">AI credit usage</h3>
            {credits && (
              <span className="text-sm font-semibold text-accent-dark">
                {credits.monthlyCreditAllowance - credits.credits} / {credits.monthlyCreditAllowance} used
              </span>
            )}
          </div>
          {credits && (
            <>
              <p className="mt-1 text-sm text-ink-muted">Refills monthly, one calendar month after your last refill.</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${credits.monthlyCreditAllowance > 0 ? Math.min(100, ((credits.monthlyCreditAllowance - credits.credits) / credits.monthlyCreditAllowance) * 100) : 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-ink-muted">{credits.credits} credits left this cycle</p>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function ProfileForm({ user, onSaved }: { user: AuthUser; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSaving(true);
    try {
      await updateProfile({ name, email });
      await onSaved();
      setMessage("Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-white p-5">
      <h3 className="font-semibold text-ink">Profile</h3>
      <p className="mb-4 text-sm text-ink-muted">Your name and email as they appear across The Wire Desk.</p>

      {message && <p className="mb-3 text-sm text-primary-dark">{message}</p>}
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Full name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Email address</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>

      <Button type="submit" className="mt-4" loading={saving}>
        Save changes
      </Button>
    </form>
  );
}

function PasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ password: newPassword });
      setMessage("Password updated.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-white p-5">
      <h3 className="font-semibold text-ink">Password</h3>
      <p className="mb-4 text-sm text-ink-muted">Choose a strong password you&apos;re not using elsewhere.</p>

      {message && <p className="mb-3 text-sm text-primary-dark">{message}</p>}
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-4">
        <div>
          <Label>New password</Label>
          <Input
            type="password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div>
          <Label>Confirm new password</Label>
          <Input
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
      </div>

      <Button type="submit" className="mt-4" loading={saving}>
        Update password
      </Button>
    </form>
  );
}
