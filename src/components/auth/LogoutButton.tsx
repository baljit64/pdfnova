"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";
import { authErrorMessage } from "../../lib/auth/errors";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return <div>
    <button className="pdfnova-secondary-button disabled:opacity-60" disabled={busy} onClick={async () => {
      if (busy) return;
      setBusy(true);
      setError(null);
      try {
        const { error } = await createBrowserSupabaseClient().auth.signOut();
        if (error) throw error;
        router.push("/");
        router.refresh();
      } catch (error) { setError(authErrorMessage(error)); }
      finally { setBusy(false); }
    }}>{busy ? "Signing out..." : "Log out"}</button>
    {error ? <p role="alert" className="mt-3 text-sm text-red-800">{error}</p> : null}
  </div>;
}
