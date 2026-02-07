/**
 * SEO config: titles and meta descriptions for every route.
 * Use keywords naturally for better Google ranking (e.g. "free PDF merger", "online PDF tools").
 * Replace SITE_URL with your production domain before deploy.
 */
const SITE_URL =
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: { VITE_SITE_URL?: string } }).env?.VITE_SITE_URL) ||
  "https://pdfnova.com";

export { SITE_URL };

export const DEFAULT_TITLE = "Free PDF Tools Online – Merge, Split, Compress & Convert PDFs | PDFNova";
export const DEFAULT_DESCRIPTION =
  "Free online PDF tools: merge, split, compress, convert PDF to Word/Excel/JPG, add watermark, sign PDF. No signup. 100% secure. Use in your browser.";

export interface RouteMeta {
  title: string;
  description: string;
}

export const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "Free PDF Tools Online – Merge, Split, Compress & Convert PDFs | PDFNova",
    description:
      "Free online PDF tools: merge, split, compress, convert PDF to Word, Excel, JPG. Add watermark, sign PDF, rotate PDF. No signup. 100% secure.",
  },
  "/merge-pdf": {
    title: "Merge PDF Online Free – Combine PDF Files in Order | PDFNova",
    description:
      "Merge PDF files online free. Combine multiple PDFs into one document in the order you want. No signup. Works in your browser. Fast and secure.",
  },
  "/split-pdf": {
    title: "Split PDF Online – Separate PDF Pages into Multiple Files Free",
    description:
      "Split PDF online free. Separate one page or all pages into independent PDF files. No signup. Instant download. 100% secure.",
  },
  "/compress-pdf": {
    title: "Compress PDF Online Free – Reduce PDF File Size | PDFNova",
    description:
      "Compress PDF online free. Reduce PDF file size while keeping good quality. No signup. Fast. Files stay in your browser.",
  },
  "/pdf-to-word": {
    title: "PDF to Word Converter Online Free – PDF to DOCX | PDFNova",
    description:
      "Convert PDF to Word online free. Get editable DOC/DOCX from PDF. Accurate conversion. No signup. Secure.",
  },
  "/pdf-to-powerpoint": {
    title: "PDF to PowerPoint Online – Convert PDF to PPT/PPTX Free",
    description:
      "Convert PDF to PowerPoint online. Turn PDF into editable PPT or PPTX slides. Free tool. No signup required.",
  },
  "/pdf-to-excel": {
    title: "PDF to Excel Online Free – Extract PDF Data to Spreadsheet",
    description:
      "Convert PDF to Excel online free. Pull data from PDF into XLS/XLSX. Free PDF to Excel converter. No signup.",
  },
  "/word-to-pdf": {
    title: "Word to PDF Converter Online Free – DOC/DOCX to PDF",
    description:
      "Convert Word to PDF online free. Turn DOC and DOCX files into PDF. No signup. Fast. Works in browser.",
  },
  "/powerpoint-to-pdf": {
    title: "PowerPoint to PDF Online Free – Convert PPT/PPTX to PDF",
    description:
      "Convert PowerPoint to PDF online free. Turn PPT and PPTX slides into one PDF. No signup. Instant.",
  },
  "/excel-to-pdf": {
    title: "Excel to PDF Online Free – Convert XLS/XLSX to PDF",
    description:
      "Convert Excel to PDF online free. Turn spreadsheets into PDF. XLS and XLSX supported. No signup.",
  },
  "/edit-pdf": {
    title: "Edit PDF Online Free – Add Text, Images, Annotations | PDFNova",
    description:
      "Edit PDF online free. Add text, images, shapes to PDF. Change font size and position. No signup. Secure.",
  },
  "/pdf-to-jpg": {
    title: "PDF to JPG Converter Online Free – Convert PDF Pages to Images",
    description:
      "Convert PDF to JPG online free. Turn each PDF page into a JPG image. No signup. Fast. High quality.",
  },
  "/pdf-to-image": {
    title: "PDF to PNG/Image Online Free – PDF to Image Converter",
    description:
      "Convert PDF to PNG or image online free. Extract PDF pages as images. No signup. Works in browser.",
  },
  "/jpg-to-pdf": {
    title: "JPG to PDF Converter Online Free – Image to PDF",
    description:
      "Convert JPG to PDF online free. Turn images into one PDF. Adjust order. No signup. Fast and secure.",
  },
  "/sign-pdf": {
    title: "Sign PDF Online Free – Add Electronic Signature to PDF",
    description:
      "Sign PDF online free. Add your signature to PDF documents. Electronic signature. No signup. Secure.",
  },
  "/watermark": {
    title: "Add Watermark to PDF Online Free – Text Watermark",
    description:
      "Add watermark to PDF online free. Stamp text over your PDF. Choose opacity and position. No signup.",
  },
  "/rotate-pdf": {
    title: "Rotate PDF Online Free – Rotate PDF Pages 90, 180, 270°",
    description:
      "Rotate PDF online free. Rotate all pages 90, 180 or 270 degrees. No signup. Instant download.",
  },
  "/convert-pdf": {
    title: "Convert PDF Online – PDF to Word, JPG, Image | PDFNova",
    description:
      "Convert PDF to Word, JPG, PNG and more. Free PDF converter tools. No signup. Secure.",
  },
  "/help": {
    title: "Help & FAQ – Free PDF Tools | PDFNova",
    description:
      "Help and FAQ for PDFNova. How to merge, split, compress and convert PDFs. Contact support.",
  },
  "/login": {
    title: "Login | PDFNova",
    description: "Login to PDFNova. Access your account.",
  },
  "/about": {
    title: "About PDFNova – Free PDF Tools Online",
    description:
      "About PDFNova. Free online PDF tools: merge, split, compress, convert. Built for everyone. No signup.",
  },
  "/privacy": {
    title: "Privacy Policy | PDFNova",
    description: "Privacy policy for PDFNova. How we handle your data. Your files are processed in your browser.",
  },
  "/terms": {
    title: "Terms of Use | PDFNova",
    description: "Terms of use for PDFNova free PDF tools.",
  },
  "/contact": {
    title: "Contact Us | PDFNova",
    description: "Contact PDFNova. Send feedback or get help with our free PDF tools.",
  },
};

/** All public indexable paths for sitemap (no login, no hash). */
export const SITEMAP_PATHS = Object.keys(ROUTE_META).filter((p) => p !== "/login");
