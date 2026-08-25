import { LockOutlined } from "@ant-design/icons";
import { PROCESSING_COPY } from "../../tools/processing";
import type { ProcessingType } from "../../tools/types";

export default function ProcessingBadge({ type }: { type: ProcessingType }) {
  const copy = PROCESSING_COPY[type];
  const serverAssisted = type !== "client";

  return (
    <aside
      className={`mb-5 flex gap-3 rounded-lg border px-4 py-3 text-sm ${
        serverAssisted
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : "border-emerald-200 bg-emerald-50 text-emerald-950"
      }`}
      aria-label="File processing information"
    >
      <LockOutlined className="mt-0.5" aria-hidden="true" />
      <div>
        <p className="font-semibold">{copy.label}</p>
        <p className="mt-0.5 leading-5">{copy.description}</p>
      </div>
    </aside>
  );
}
