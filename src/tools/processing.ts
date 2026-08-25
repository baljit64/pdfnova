import type { ProcessingType } from "./types";

export const PROCESSING_COPY: Record<ProcessingType, { label: string; description: string }> = {
  client: {
    label: "Processed locally in your browser",
    description: "Your selected file is handled in this browser tab and is not sent to PDFNova's API.",
  },
  server: {
    label: "Secure server-assisted processing",
    description: "Your file is sent over HTTPS to PDFNova's conversion provider for temporary processing.",
  },
  hybrid: {
    label: "Browser and server-assisted processing",
    description: "This tool uses both your browser and a secure server-assisted processing step.",
  },
};
