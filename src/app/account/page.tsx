import { redirect } from "next/navigation";
import Image from "next/image";
import AuthShell from "../../components/auth/AuthShell";
import LogoutButton from "../../components/auth/LogoutButton";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { logAuthError } from "../../lib/auth/errors";
import { avatarUrl, profileText, userDisplayName } from "../../lib/auth/profile";

export const metadata = { title: "Your account | PDFNova", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account");
  const { data: profile, error } = await supabase.from("profiles")
    .select("full_name, avatar_url, provider").eq("id", user.id).maybeSingle();
  if (error) logAuthError("Profile lookup", error);
  const name = profileText(profile?.full_name) ?? userDisplayName(user);
  const avatar = avatarUrl(profile?.avatar_url, user.user_metadata.avatar_url, user.user_metadata.picture);
  return <AuthShell title="Your account" description="Manage your PDFNova account.">
    <div className="space-y-5">
      {avatar ? <Image unoptimized width={64} height={64} src={avatar} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-full object-cover" /> : null}
      <div><h2 className="text-xl font-bold">{name}</h2><p className="mt-2 break-all text-[var(--text-secondary)]">{user.email ?? "Email not provided"}</p></div>
      {error ? <p role="status" className="text-sm text-[var(--text-secondary)]">Profile details are temporarily unavailable.</p> : null}
      <LogoutButton />
    </div>
  </AuthShell>;
}
