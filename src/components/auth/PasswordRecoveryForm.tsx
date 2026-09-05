"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";
import { authErrorMessage } from "../../lib/auth/errors";
import { validateEmail, validatePassword } from "../../lib/auth/validation";
import PasswordField from "./PasswordField";

export default function PasswordRecoveryForm({ reset = false }: { reset?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const invalid = reset ? validatePassword(password) || (password !== confirmation ? "Passwords do not match." : null) : validateEmail(email);
    setError(invalid);
    if (invalid) return;
    setBusy(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = reset
        ? await supabase.auth.updateUser({ password })
        : await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
      if (error) throw error;
      setPassword("");
      setConfirmation("");
      setSuccess(true);
      if (reset) router.refresh();
    } catch (error) { setError(authErrorMessage(error)); }
    finally { setBusy(false); }
  }

  if (success) return <div className="space-y-5">
    <p role="status">{reset ? "Your password has been updated." : "If an account exists for this email, you will receive a password reset link. Open it in this browser."}</p>
    <Link className="font-semibold" href={reset ? "/account" : "/login"}>{reset ? "Continue to your account" : "Back to sign in"}</Link>
  </div>;

  return <form onSubmit={submit} noValidate className="space-y-5">
    {reset ? <>
      <PasswordField id="reset-password" name="password" label="New password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <PasswordField id="reset-confirm" name="confirmation" label="Confirm password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
    </> : <div>
      <label htmlFor="recovery-email" className="mb-2 block text-sm font-semibold">Email</label>
      <input id="recovery-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-xl border border-[var(--border-strong)] bg-white px-4 outline-none focus:border-[var(--primary)] focus:ring-3 focus:ring-red-100" />
    </div>}
    {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
    <button disabled={busy} className="pdfnova-primary-button w-full disabled:opacity-60">{busy ? "Please wait..." : reset ? "Update password" : "Send reset link"}</button>
  </form>;
}
