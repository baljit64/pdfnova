"use client";

import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "../lib/supabase/client";
import { authErrorMessage, logAuthError } from "../lib/auth/errors";
import { avatarUrl, userDisplayName } from "../lib/auth/profile";
import Link from "next/link";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useState, type FocusEvent } from "react";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import Container from "./ui/Container";
import ToolIcon from "./tools/ToolIcon";

type MenuName = "tools" | "convert" | null;

const TOOL_GROUPS = [
  {
    title: "Organize",
    links: [
      ["merge-pdf", "Merge PDF"],
      ["split-pdf", "Split PDF"],
      ["rotate-pdf", "Rotate PDF"],
    ],
  },
  {
    title: "Optimize & edit",
    links: [
      ["compress-pdf", "Compress PDF"],
      ["edit-pdf", "Edit PDF"],
      ["watermark", "Watermark PDF"],
      ["sign-pdf", "Sign PDF"],
    ],
  },
  {
    title: "Convert from PDF",
    links: [
      ["pdf-to-word", "PDF to Word"],
      ["pdf-to-jpg", "PDF to JPG"],
      ["pdf-to-image", "PDF to PNG"],
    ],
  },
  {
    title: "Convert to PDF",
    links: [
      ["word-to-pdf", "Word to PDF"],
      ["excel-to-pdf", "Excel to PDF"],
      ["jpg-to-pdf", "JPG to PDF"],
    ],
  },
] as const;

const CONVERT_GROUPS = TOOL_GROUPS.slice(2);

function MegaMenu({ groups, onNavigate }: { groups: typeof TOOL_GROUPS; onNavigate: () => void }) {
  return (
    <div className={`grid gap-7 p-6 ${groups.length > 2 ? "lg:grid-cols-4" : "sm:grid-cols-2"}`}>
      {groups.map((group) => (
        <section key={group.title} aria-label={group.title}>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            {group.title}
          </p>
          <div className="space-y-1">
            {group.links.map(([id, label]) => (
              <Link
                key={id}
                href={`/${id}`}
                onClick={onNavigate}
                className="group flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-semibold text-[var(--text-primary)] no-underline transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary-hover)]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] bg-white text-[var(--primary)] transition group-hover:border-[#f4c7c0]">
                  <ToolIcon id={id} className="h-4.5 w-4.5" />
                </span>
                {label}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function AccountIdentity({ user, compact = false, large = false }: { user: User; compact?: boolean; large?: boolean }) {
  const name = userDisplayName(user);
  const photo = avatarUrl(user.user_metadata.avatar_url, user.user_metadata.picture);
  const initial = name.charAt(0).toUpperCase();
  const avatarClass = large ? "h-12 w-12" : "h-9 w-9";

  return (
    <>
      {photo ? (
        <Image
          unoptimized
          src={photo}
          alt=""
          width={large ? 48 : 36}
          height={large ? 48 : 36}
          className={`${avatarClass} shrink-0 rounded-full object-cover`}
        />
      ) : (
        <span
          aria-hidden="true"
          className={`grid ${avatarClass} shrink-0 place-items-center rounded-full bg-[var(--primary)] text-sm font-bold text-white`}
        >
          {initial}
        </span>
      )}
      {!compact ? <span className="max-w-32 truncate">{name}</span> : null}
    </>
  );
}

function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = userDisplayName(user);

  const closeWhenFocusLeaves = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  };

  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await createBrowserSupabaseClient().auth.signOut();
      if (error) throw error;
      setOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      setError(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="relative hidden lg:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={closeWhenFocusLeaves}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Open ${name}'s account menu`}
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 max-w-52 items-center gap-2 rounded-full border border-[var(--border)] bg-white py-1 pl-1 pr-3 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-xs)] transition hover:border-slate-400 hover:bg-slate-50"
      >
        <AccountIdentity user={user} />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-full z-[60] w-72 pt-2 text-left"
        >
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-lg)]">
            <div className="flex items-center gap-3">
              <AccountIdentity user={user} large compact />
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--text-primary)]">{name}</p>
                <p className="truncate text-sm text-[var(--text-secondary)]">{user.email ?? "Email not provided"}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-[var(--border)] pt-3">
              <button
                type="button"
                role="menuitem"
                disabled={busy}
                onClick={() => void signOut()}
                className="pdfnova-secondary-button w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Signing out..." : "Log out"}
              </button>
              {error ? <p role="alert" className="mt-2 text-sm text-red-800">{error}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    try {
      const { data: { subscription } } = createBrowserSupabaseClient().auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    } catch (error) { logAuthError("Navbar authentication", error); }
  }, []);

  const [openMenu, setOpenMenu] = useState<MenuName>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 shadow-[0_1px_8px_rgb(16_24_40/0.05)] backdrop-blur-xl">
      <Container className="relative flex h-[72px] items-center justify-between gap-5">
        <Link href="/" onClick={() => { setOpenMenu(null); setMobileOpen(false); }} className="flex shrink-0 no-underline" aria-label="PDFNova home">
          <Image
            src="/assets/pdf-nova-logo-horizontal.png"
            alt="PDFNova"
            width={157}
            height={50}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          <button
            type="button"
            onMouseEnter={() => setOpenMenu("tools")}
            onClick={() => setOpenMenu(openMenu === "tools" ? null : "tools")}
            aria-expanded={openMenu === "tools"}
            className="inline-flex h-10 items-center gap-1 rounded-lg border-0 bg-transparent px-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-slate-100"
          >
            PDF Tools <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseEnter={() => setOpenMenu("convert")}
            onClick={() => setOpenMenu(openMenu === "convert" ? null : "convert")}
            aria-expanded={openMenu === "convert"}
            className="inline-flex h-10 items-center gap-1 rounded-lg border-0 bg-transparent px-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-slate-100"
          >
            Convert <ChevronDown className="h-4 w-4" />
          </button>
          <Link href="/compress-pdf" onClick={() => setOpenMenu(null)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] no-underline hover:bg-slate-100">
            Compress
          </Link>
          <Link href="/blog" onClick={() => setOpenMenu(null)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--text-primary)] no-underline hover:bg-slate-100">
            Blog
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/#tool-search"
            onClick={() => setOpenMenu(null)}
            aria-label="Search PDF tools"
            className="hidden h-10 w-10 place-items-center rounded-lg text-[var(--text-secondary)] no-underline hover:bg-slate-100 hover:text-[var(--primary)] sm:grid"
          >
            <Search className="h-5 w-5" />
          </Link>
          <div className="hidden sm:block"><LanguageSwitcher /></div>
          {user ? <UserMenu user={user} /> : (
            <Link href="/login" className="pdfnova-primary-button hidden !h-10 !min-h-10 !rounded-lg !px-4 !py-0 lg:inline-flex">
              Log in
            </Link>
          )}
          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--border)] bg-white text-[var(--text-primary)] lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {openMenu ? (
          <div
            onMouseLeave={() => setOpenMenu(null)}
            className={`absolute top-[64px] z-50 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-lg)] ${openMenu === "tools" ? "left-5 right-5" : "left-1/2 w-[620px] -translate-x-1/2"}`}
          >
            <MegaMenu
              groups={(openMenu === "tools" ? TOOL_GROUPS : CONVERT_GROUPS) as typeof TOOL_GROUPS}
              onNavigate={() => setOpenMenu(null)}
            />
          </div>
        ) : null}
      </Container>

      {mobileOpen ? (
        <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-[var(--border)] bg-white lg:hidden">
          <Container className="py-5">
            <Link href="/#tool-search" className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--page)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] no-underline">
              <Search className="h-4 w-4" /> Search tools
            </Link>
            <MegaMenu groups={TOOL_GROUPS} onNavigate={() => setMobileOpen(false)} />
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-5">
              <Link href="/blog" onClick={() => setMobileOpen(false)} className="pdfnova-secondary-button !min-h-11">Blog</Link>
              {user ? (
                <div className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text-primary)]">
                  <AccountIdentity user={user} compact />
                  <span className="truncate">{userDisplayName(user)}</span>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="pdfnova-primary-button !min-h-11">Log in</Link>
              )}
            </div>
            <div className="mt-4 sm:hidden"><LanguageSwitcher /></div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
