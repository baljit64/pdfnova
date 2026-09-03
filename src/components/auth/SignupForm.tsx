"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authErrorMessage } from "../../lib/auth/errors";
import { buildSignupOptions } from "../../lib/auth/signup";
import {
  type FieldErrors,
  type SignupValues,
  validateSignup,
} from "../../lib/auth/validation";
import { safeRedirectPath } from "../../lib/auth/redirect";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";
import PasswordField from "./PasswordField";

const INITIAL_VALUES: SignupValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignupForm() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors<SignupValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const updateValue = (name: keyof SignupValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validateSignup(values);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const search = new URLSearchParams(window.location.search);
      const destination = safeRedirectPath(search.get("redirect"), "/");
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: buildSignupOptions({
          fullName: values.fullName,
          origin: window.location.origin,
          destination,
        }),
      });

      if (error) throw error;
      setSubmittedEmail(values.email.trim());
    } catch (error) {
      setFormError(authErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedEmail) {
    return (
      <div className="text-center" role="status">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--success-soft)] text-xl text-[var(--success)]">
          ✓
        </div>
        <h2 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">Check your email</h2>
        <p className="mt-2 leading-7 text-[var(--text-secondary)]">
          We&apos;ve sent a confirmation link to <strong>{submittedEmail}</strong>.
        </p>
      </div>
    );
  }

  const fieldClass =
    "h-12 w-full rounded-xl border border-[var(--border-strong)] bg-white px-4 text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)] focus:ring-3 focus:ring-red-100";

  return (
    <>
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="signup-name" className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
            Full name
          </label>
          <input
            id="signup-name"
            name="fullName"
            value={values.fullName}
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "signup-name-error" : undefined}
            onChange={(event) => updateValue("fullName", event.target.value)}
            className={fieldClass}
          />
          {errors.fullName ? <p id="signup-name-error" className="mt-1.5 text-sm text-[var(--primary-hover)]">{errors.fullName}</p> : null}
        </div>

        <div>
          <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            value={values.email}
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            onChange={(event) => updateValue("email", event.target.value)}
            className={fieldClass}
          />
          {errors.email ? <p id="signup-email-error" className="mt-1.5 text-sm text-[var(--primary-hover)]">{errors.email}</p> : null}
        </div>

        <PasswordField
          id="signup-password"
          label="Password"
          name="password"
          value={values.password}
          autoComplete="new-password"
          error={errors.password}
          onChange={(event) => updateValue("password", event.target.value)}
        />

        <PasswordField
          id="signup-confirm-password"
          label="Confirm password"
          name="confirmPassword"
          value={values.confirmPassword}
          autoComplete="new-password"
          error={errors.confirmPassword}
          onChange={(event) => updateValue("confirmPassword", event.target.value)}
        />

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
          {submitting ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Already have an account? <Link href="/login" className="font-semibold">Sign in</Link>
      </p>
    </>
  );
}
