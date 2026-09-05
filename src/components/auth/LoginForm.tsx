"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { authErrorMessage } from "../../lib/auth/errors";
import { safeRedirectPath } from "../../lib/auth/redirect";
import {
  type FieldErrors,
  type LoginValues,
  validateLogin,
} from "../../lib/auth/validation";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";
import PasswordField from "./PasswordField";
import SocialAuthButtons from "./SocialAuthButtons";

const INITIAL_VALUES: LoginValues = { email: "", password: "" };

export default function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors<LoginValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");
    if (error === "confirmation_failed") {
      setFormError("That sign-in link is invalid or has expired. Please try again.");
    } else if (error === "oauth_failed") {
      setFormError("Social sign-in was cancelled or could not be completed. Please try again.");
    }
  }, []);

  const updateValue = (name: keyof LoginValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { error } = await createBrowserSupabaseClient().auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });
      if (error) throw error;

      const search = new URLSearchParams(window.location.search);
      router.replace(safeRedirectPath(search.get("redirect")));
      router.refresh();
    } catch (error) {
      setFormError(authErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "h-12 w-full rounded-xl border border-[var(--border-strong)] bg-white px-4 text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)] focus:ring-3 focus:ring-red-100";

  return (
    <>
      <SocialAuthButtons />

      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            value={values.email}
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            onChange={(event) => updateValue("email", event.target.value)}
            className={fieldClass}
          />
          {errors.email ? (
            <p id="login-email-error" className="mt-1.5 text-sm text-[var(--primary-hover)]">
              {errors.email}
            </p>
          ) : null}
        </div>

        <PasswordField
          id="login-password"
          label="Password"
          name="password"
          value={values.password}
          autoComplete="current-password"
          error={errors.password}
          onChange={(event) => updateValue("password", event.target.value)}
        />

        <div className="text-right text-sm"><Link href="/forgot-password" className="font-semibold">Forgot password?</Link></div>

        {formError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="pdfnova-primary-button w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Don&apos;t have an account? <Link href="/signup" className="font-semibold">Create one</Link>
      </p>
    </>
  );
}
