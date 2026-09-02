import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ToolIcon from "./ToolIcon";

type ToolCardProps = {
  id: string;
  href: string;
  title: string;
  description: string;
  badge?: string;
  unavailable?: boolean;
  compact?: boolean;
  hidden?: boolean;
};

export default function ToolCard({
  id,
  href,
  title,
  description,
  badge,
  unavailable = false,
  compact = false,
  hidden = false,
}: ToolCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
          <ToolIcon id={id} />
        </span>
        {badge ? (
          <span className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">
            {badge}
          </span>
        ) : null}
      </div>
      <div className={compact ? "mt-4" : "mt-5"}>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--primary)]">
        {unavailable ? "Coming soon" : "Use tool"}
        {!unavailable ? <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /> : null}
      </span>
    </>
  );

  const classes = `group block h-full rounded-2xl border border-[var(--border)] bg-white ${compact ? "p-5" : "p-6"} text-left no-underline shadow-[var(--shadow-xs)] transition duration-200 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-md)]`;

  if (unavailable) {
    return <article hidden={hidden} className={`${classes} cursor-default opacity-75`}>{content}</article>;
  }

  return (
    <Link href={href} hidden={hidden} className={classes}>
      {content}
    </Link>
  );
}
