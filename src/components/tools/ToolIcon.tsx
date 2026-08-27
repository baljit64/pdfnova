import {
  Combine,
  FileImage,
  FilePenLine,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Images,
  Minimize2,
  PenTool,
  RotateCw,
  Scissors,
  Stamp,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "merge-pdf": Combine,
  "split-pdf": Scissors,
  "compress-pdf": Minimize2,
  "rotate-pdf": RotateCw,
  watermark: Stamp,
  "sign-pdf": PenTool,
  "edit-pdf": FilePenLine,
  "pdf-to-jpg": FileImage,
  "pdf-to-image": Images,
  "jpg-to-pdf": ImageIcon,
  "pdf-to-word": FileText,
  "word-to-pdf": FileText,
  "excel-to-pdf": FileSpreadsheet,
  "pdf-to-powerpoint": FileText,
  "pdf-to-excel": FileSpreadsheet,
  "powerpoint-to-pdf": FileText,
};

export default function ToolIcon({
  id,
  className = "h-6 w-6",
}: {
  id: string;
  className?: string;
}) {
  const Icon = ICONS[id] ?? FileText;
  return <Icon className={className} strokeWidth={1.8} aria-hidden="true" />;
}
