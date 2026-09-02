import type { ToolId } from "../../tools/types";

export interface ToolSeo {
  title: string;
  description: string;
  h1: string;
}

/**
 * Search copy for canonical, working tools.
 *
 * Keeping this separate from interface labels lets each page target its own
 * search intent without turning button text and navigation labels into SEO copy.
 */
export const TOOL_SEO: Record<ToolId, ToolSeo> = {
  "merge-pdf": {
    title: "Merge PDF Online Free – Combine PDF Files | PDFNova",
    description:
      "Merge multiple PDF files online for free with PDFNova. Arrange pages, combine documents in your chosen order, and download one PDF without a signup.",
    h1: "Merge PDF Online",
  },
  "split-pdf": {
    title: "Split PDF Online Free – Extract PDF Pages | PDFNova",
    description:
      "Split a PDF online for free with PDFNova. Extract selected pages or create separate PDF files with a visual, browser-based PDF splitter.",
    h1: "Split PDF Online",
  },
  "compress-pdf": {
    title: "Compress PDF Online Free – Reduce PDF Size | PDFNova",
    description:
      "Compress PDF files online for free and reduce file size with lossless, balanced, strong, or target-size options. Preview the result before downloading.",
    h1: "Compress PDF Online",
  },
  "rotate-pdf": {
    title: "Rotate PDF Online Free – Turn PDF Pages | PDFNova",
    description:
      "Rotate PDF pages online for free with PDFNova. Fix sideways pages, choose specific pages, preview the result, and save the rotation permanently.",
    h1: "Rotate PDF Online",
  },
  watermark: {
    title: "Watermark PDF Online Free – Add Text or Logo | PDFNova",
    description:
      "Add a text or image watermark to PDF pages online for free. Control placement, size, opacity, and page selection before downloading your PDF.",
    h1: "Watermark PDF Online",
  },
  "sign-pdf": {
    title: "Sign PDF Online Free – Add a Signature | PDFNova",
    description:
      "Sign a PDF online for free with PDFNova. Type, draw, or upload a signature, place it on the page you choose, and download the signed PDF.",
    h1: "Sign PDF Online",
  },
  "edit-pdf": {
    title: "Edit PDF Online Free – Add Text to a PDF | PDFNova",
    description:
      "Edit a PDF online for free by adding text annotations to the page you choose. Set the font, size, color, and position, then preview the result.",
    h1: "Edit PDF Online",
  },
  "pdf-to-jpg": {
    title: "PDF to JPG Converter Online Free | PDFNova",
    description:
      "Convert PDF pages to JPG images online for free. Choose page ranges and image quality, preview the output, and download one image or a ZIP file.",
    h1: "PDF to JPG Converter",
  },
  "pdf-to-image": {
    title: "PDF to PNG Converter Online Free | PDFNova",
    description:
      "Convert PDF pages to high-quality PNG images online for free. Choose the pages and resolution, preview each image, and download the results.",
    h1: "PDF to PNG Converter",
  },
  "jpg-to-pdf": {
    title: "JPG to PDF Converter Online Free | PDFNova",
    description:
      "Convert JPG and JPEG images to PDF online for free. Arrange multiple images, choose page size and margins, and download one polished PDF.",
    h1: "JPG to PDF Converter",
  },
  "pdf-to-word": {
    title: "PDF to Word Converter Online Free | PDFNova",
    description:
      "Convert PDF files to editable Word documents online with PDFNova. Create a DOCX using server-assisted conversion with clear processing information.",
    h1: "PDF to Word Converter",
  },
  "word-to-pdf": {
    title: "Word to PDF Converter Online Free | PDFNova",
    description:
      "Convert Word documents to PDF online with PDFNova. Turn DOC and DOCX files into shareable PDFs using clearly labelled server-assisted conversion.",
    h1: "Word to PDF Converter",
  },
  "excel-to-pdf": {
    title: "Excel to PDF Converter Online Free | PDFNova",
    description:
      "Convert Excel spreadsheets to PDF online for free. Turn XLS, XLSX, or CSV data into readable PDF tables with sheet and orientation controls.",
    h1: "Excel to PDF Converter",
  },
};

export function getToolSeo(id: ToolId): ToolSeo {
  return TOOL_SEO[id];
}
