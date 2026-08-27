import { Cloud, ShieldCheck } from "lucide-react";
import { PROCESSING_COPY } from "../../tools/processing";
import type { ProcessingType } from "../../tools/types";

export default function ProcessingBadge({ type }: { type: ProcessingType }) {
  const copy = PROCESSING_COPY[type];
  const serverAssisted = type !== "client";

  return (
    <aside
      className={`mb-6 flex gap-3 rounded-xl border px-4 py-3.5 text-sm ${
        serverAssisted
          ? "border-amber-200 bg-[var(--warning-soft)] text-amber-950"
          : "border-emerald-200 bg-[var(--success-soft)] text-emerald-950"
      }`}
      aria-label="File processing information"
    >
      {serverAssisted ? <Cloud className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> : <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />}
      <div>
        <p className="font-semibold">{copy.label}</p>
        <p className="mt-0.5 leading-5">{copy.description}</p>
      </div>
    </aside>
  );
}
