"use client";

import { useState, type SVGProps } from "react";
import { authErrorMessage } from "../../lib/auth/errors";
import {
  buildOAuthOptions,
  SOCIAL_AUTH_PROVIDERS,
  type SocialAuthProvider,
} from "../../lib/auth/oauth";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M21.6 12.23c0-.74-.07-1.46-.19-2.15H12v4.07h5.38a4.6 4.6 0 0 1-2 3.02v2.64h3.24c1.9-1.75 2.98-4.33 2.98-7.58Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.24-2.64c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.72A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.77A6 6 0 0 1 6.07 12c0-.61.11-1.2.32-1.77V7.51H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.35-2.72Z" />
      <path fill="#EA4335" d="M12 6.1c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.72C7.18 7.86 9.39 6.1 12 6.1Z" />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

const ICONS: Record<SocialAuthProvider["provider"], typeof GoogleIcon> = {
  google: GoogleIcon,
  facebook: FacebookIcon,
};

export default function SocialAuthButtons() {
  const [activeProvider, setActiveProvider] = useState<
    SocialAuthProvider["provider"] | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signIn = async (provider: SocialAuthProvider["provider"]) => {
    if (activeProvider) return;

    setActiveProvider(provider);
    setErrorMessage(null);

    try {
      const search = new URLSearchParams(window.location.search);
      const { error } = await createBrowserSupabaseClient().auth.signInWithOAuth({
        provider,
        options: buildOAuthOptions({
          origin: window.location.origin,
          destination: search.get("redirect"),
        }),
      });

      if (error) throw error;
    } catch (error) {
      setErrorMessage(authErrorMessage(error));
      setActiveProvider(null);
    }
  };

  return (
    <div>
      <div className="space-y-3" role="group" aria-label="Social sign in options">
        {SOCIAL_AUTH_PROVIDERS.map(({ provider, label }) => {
          const Icon = ICONS[provider];
          const isActive = activeProvider === provider;

          return (
            <button
              key={provider}
              type="button"
              disabled={activeProvider !== null}
              aria-busy={isActive}
              onClick={() => void signIn(provider)}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[var(--border-strong)] bg-white px-4 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-xs)] transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${provider === "facebook" ? "text-[#1877F2]" : ""}`}
              />
              <span>{isActive ? `Connecting to ${label.replace("Continue with ", "")}...` : label}</span>
            </button>
          );
        })}
      </div>

      {errorMessage ? (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs font-medium text-[var(--text-muted)]">or continue with email</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>
    </div>
  );
}
