 "use client";

import Link from "next/link";
import { Clock3 } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center sm:py-28">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]"><Clock3 className="h-7 w-7" /></span>
      <p className="section-eyebrow mt-6">Coming soon</p>
      <h1 className="mb-4 mt-4 text-4xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h1>
      <p className="mb-6 text-lg leading-7 text-[var(--text-secondary)]">{description}</p>
      <p className="mb-8 text-sm leading-6 text-[var(--text-muted)]">
        This tool requires server-side processing. We&apos;re working on bringing it to you soon.
      </p>
      <Link href="/#all-tools" className="pdfnova-primary-button">Back to all tools</Link>
    </div>
  );
}
