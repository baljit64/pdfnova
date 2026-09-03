"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ChangeEventHandler } from "react";

interface PasswordFieldProps {
  id: string;
  label: string;
  name: string;
  value: string;
  autoComplete: "current-password" | "new-password";
  error?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export default function PasswordField({
  id,
  label,
  name,
  value,
  autoComplete,
  error,
  onChange,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={onChange}
          className="h-12 w-full rounded-xl border border-[var(--border-strong)] bg-white px-4 pr-12 text-[var(--text-primary)] outline-none transition focus:border-[var(--primary)] focus:ring-3 focus:ring-red-100"
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg border-0 bg-transparent text-[var(--text-secondary)] hover:bg-slate-100"
        >
          {visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-[var(--primary-hover)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
