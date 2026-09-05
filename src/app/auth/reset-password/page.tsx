import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "../../../components/auth/AuthShell";
import PasswordRecoveryForm from "../../../components/auth/PasswordRecoveryForm";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

export const metadata = { title: "Reset password | PDFNova", robots: { index: false, follow: false } };

export default async function ResetPasswordPage({ searchParams }: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;
  // Exchange PKCE in a Route Handler where the session cookies can be written.
  if (params.code && !params.error) {
    const query = new URLSearchParams({ code: params.code, next: "/auth/reset-password" });
    redirect(`/auth/callback?${query}`);
  }
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <AuthShell title="Reset your password" description="Choose a new password for your account.">
    {user && !params.error ? <PasswordRecoveryForm reset /> : <p role="alert">This reset link is invalid or has expired. <Link href="/forgot-password">Request another link</Link>.</p>}
  </AuthShell>;
}
