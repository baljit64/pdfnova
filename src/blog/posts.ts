export type BlogCategory = "Guides" | "Productivity" | "Privacy";

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  category: BlogCategory;
  readingTime: number;
  featured?: boolean;
  visual: "compress" | "merge" | "split" | "images" | "privacy" | "study";
  tool: { href: string; label: string; description: string };
  introduction: string[];
  sections: BlogSection[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-reduce-pdf-file-size",
    title: "How to reduce PDF file size for email and online forms",
    excerpt:
      "A practical guide to making a PDF smaller while keeping text readable and images clear enough for its destination.",
    publishedAt: "2026-08-08",
    category: "Guides",
    readingTime: 6,
    featured: true,
    visual: "compress",
    tool: {
      href: "/compress-pdf",
      label: "Compress a PDF",
      description: "Choose a balanced, strong, lossless, or target-size compression mode.",
    },
    introduction: [
      "A PDF can look perfectly ordinary and still be too large for an email attachment, application portal, or government form. The usual cause is not the number of pages. It is the amount of image data, embedded fonts, and unused document information stored inside the file.",
      "The right way to shrink it depends on where the file is going. A text-heavy contract needs crisp lettering, while a scanned receipt can usually tolerate stronger image compression. Start with the destination limit, then use the lightest setting that gets below it.",
    ],
    sections: [
      {
        heading: "Check the limit before you compress",
        paragraphs: [
          "Look for the exact maximum on the upload form or in the email provider's attachment rules. A form asking for a file under 1 MB needs a different approach from an inbox that accepts 20 MB. Knowing the target prevents repeated trial and error.",
          "If the file is only slightly over the limit, use balanced compression first. Strong compression is better reserved for image-heavy scans or strict limits because it may soften fine details.",
        ],
        bullets: [
          "For general sharing: favour balanced compression.",
          "For archiving or print: use lossless compression when possible.",
          "For a fixed portal limit: enter the target size and check the result.",
        ],
      },
      {
        heading: "Compress the PDF in four steps",
        paragraphs: [
          "Open PDFNova's Compress PDF tool and add the document. Select a compression level based on your target. Balanced is the safest starting point; strong produces a smaller file, while target-size mode keeps trying to fit a limit you provide.",
          "Run the tool and download the new PDF. Keep the original until you have opened the smaller copy and checked the pages that matter most.",
        ],
        bullets: [
          "Add one PDF from your device.",
          "Choose balanced, strong, lossless, or target-size mode.",
          "Start compression and download the result.",
          "Open the output and inspect text, signatures, charts, and small print.",
        ],
      },
      {
        heading: "What to inspect after compression",
        paragraphs: [
          "Do not judge the result from file size alone. Zoom into scanned text, thin lines in charts, QR codes, signatures, and any page containing small labels. These areas reveal quality loss sooner than large headings or simple paragraphs.",
          "If the document became hard to read, go back to the original and select a gentler level. Recompressing an already compressed copy compounds image degradation, so each new attempt should begin with the source file.",
        ],
      },
      {
        heading: "When compression is not enough",
        paragraphs: [
          "A PDF made from hundreds of photographs may remain large even after strong compression. In that case, remove pages the recipient does not need, split the document into permitted sections, or recreate oversized source images at a sensible resolution before exporting again.",
          "For email, you can also send a trusted cloud link instead of an attachment. For formal upload portals, splitting is only appropriate when the portal accepts more than one file, so check its instructions first.",
        ],
      },
    ],
  },
  {
    slug: "merge-pdf-files-in-the-right-order",
    title: "How to merge PDF files and keep every page in order",
    excerpt:
      "Combine reports, scans, and attachments into one clean PDF without mixing up the sequence or orientation.",
    publishedAt: "2026-08-04",
    category: "Guides",
    readingTime: 5,
    visual: "merge",
    tool: {
      href: "/merge-pdf",
      label: "Merge PDF files",
      description: "Reorder, rotate, and combine up to 30 PDF files into one document.",
    },
    introduction: [
      "Merging PDFs is simple; merging them into a document someone else can understand takes a little preparation. File names are not always sorted naturally, portrait scans can arrive sideways, and appendices can quietly land before the main report.",
      "A short review before and after merging prevents the most common mistakes. The goal is a single file with a predictable reading order, consistent orientation, and a useful name.",
    ],
    sections: [
      {
        heading: "Decide the reading order first",
        paragraphs: [
          "List the sections as a reader should encounter them: cover letter, main document, supporting evidence, then appendices. Rename the source files with simple numeric prefixes such as 01, 02, and 03 if you need to organise a large batch before uploading.",
          "Page numbers printed inside each PDF do not control the merge order. The order of the files in the tool does, so check the list even when the file names look correct.",
        ],
      },
      {
        heading: "Merge the files step by step",
        paragraphs: [
          "Add at least two PDFs to the Merge PDF tool. Drag the files into the final sequence, rotate any document that was scanned sideways, and remove accidental duplicates. When the list matches your plan, start the merge and save the combined file.",
        ],
        bullets: [
          "Select all PDFs that belong in the final document.",
          "Drag files into the intended reading order.",
          "Rotate sideways sources before processing.",
          "Merge, download, and give the result a descriptive name.",
        ],
      },
      {
        heading: "Review the joins, not just the first page",
        paragraphs: [
          "Open the finished file and jump to every point where one source document ends and the next begins. Those boundaries are where blank pages, repeated covers, or unexpected orientation changes tend to appear.",
          "Also confirm that the total page count roughly matches the sum of the sources. A quick page-count check can expose a missing attachment before the document is submitted or shared.",
        ],
      },
      {
        heading: "Make the final PDF easier to use",
        paragraphs: [
          "Use a file name that describes the content and version, such as project-proposal-final.pdf. Avoid names like merged.pdf or document-2.pdf, which become confusing once downloaded.",
          "If the combined file is too large for its destination, compress the final PDF once. Compressing every source separately takes longer and can apply unnecessary quality loss more than once.",
        ],
      },
    ],
  },
  {
    slug: "split-pdf-and-extract-pages",
    title: "How to split a PDF and extract only the pages you need",
    excerpt:
      "Separate a long PDF into individual pages or pull out selected ranges for faster, cleaner sharing.",
    publishedAt: "2026-07-29",
    category: "Guides",
    readingTime: 5,
    visual: "split",
    tool: {
      href: "/split-pdf",
      label: "Split a PDF",
      description: "Create one PDF per page or extract selected page ranges.",
    },
    introduction: [
      "You rarely need to send an entire handbook, statement, or scan when the recipient only needs a few pages. Extracting the relevant section makes the attachment smaller and reduces the chance of sharing unrelated information.",
      "PDFNova supports two useful split patterns: create a separate PDF for every page, or extract a page range into a new document. Choose the mode based on what you plan to do next.",
    ],
    sections: [
      {
        heading: "Choose between splitting and extracting",
        paragraphs: [
          "Use one-file-per-page mode when every page needs to become an independent item, such as a batch of scanned receipts. Use range extraction when several consecutive or selected pages belong together, such as one chapter from a manual.",
          "Before entering a range, confirm the page numbers shown by your PDF viewer. Printed page labels can differ from the file's actual page positions when a document includes an unnumbered cover or contents page.",
        ],
      },
      {
        heading: "Extract pages accurately",
        paragraphs: [
          "Open the Split PDF tool, add the source file, and select the range option. Enter pages using a clear pattern such as 1-3, 7, 9-12. The result contains the requested pages in their original order.",
        ],
        bullets: [
          "Use a hyphen for a continuous range: 4-8.",
          "Use commas for separate pages or ranges: 2, 5-7, 10.",
          "Start page numbers at 1, not 0.",
          "Review the first and last extracted pages before sharing.",
        ],
      },
      {
        heading: "Protect information you did not intend to share",
        paragraphs: [
          "Extraction creates a new file containing only the chosen pages, which is safer than asking a recipient to ignore the rest of a document. It is especially useful for statements, identification packets, and case files that contain unrelated records.",
          "Still inspect the selected pages themselves. Headers, footers, comments, or attachments may contain names and reference numbers you did not notice at first glance.",
        ],
      },
      {
        heading: "Name the extracted file clearly",
        paragraphs: [
          "A useful name explains what the new PDF contains without requiring someone to open it. invoice-july-pages-4-5.pdf is better than split-1.pdf. Clear naming matters even more when one source becomes many files.",
          "If you later need to recombine selected pieces, arrange them in the Merge PDF tool and create a new, purpose-built document.",
        ],
      },
    ],
  },
  {
    slug: "convert-jpg-images-to-one-pdf",
    title: "How to turn JPG images into one shareable PDF",
    excerpt:
      "Collect phone scans, receipts, and photos into a single PDF that is easier to upload, print, and review.",
    publishedAt: "2026-07-23",
    category: "Guides",
    readingTime: 5,
    visual: "images",
    tool: {
      href: "/jpg-to-pdf",
      label: "Convert JPG to PDF",
      description: "Arrange multiple JPG images and package them into a single PDF.",
    },
    introduction: [
      "A folder of phone photos is awkward to submit and easy to view in the wrong order. Converting the images into one PDF creates a predictable document that opens consistently across devices and is simpler to attach to a form or email.",
      "Good results begin before conversion. Straighten each photo, crop away the desk or background, and make sure small text is readable. The converter can package images, but it cannot restore detail that the camera did not capture.",
    ],
    sections: [
      {
        heading: "Prepare the images",
        paragraphs: [
          "Place each page on a flat, evenly lit surface. Hold the camera directly above it to avoid a trapezoid shape, and keep shadows away from the text. Use the highest practical camera quality, then crop and rotate before building the PDF.",
          "If the pages have a sequence, rename or select them in that order. A numbered set such as receipt-01.jpg through receipt-06.jpg is much easier to verify than a collection of camera-generated names.",
        ],
        bullets: [
          "Use even light and avoid glare on glossy paper.",
          "Capture all four corners of every page.",
          "Rotate images upright before conversion.",
          "Check fine print at 100% zoom.",
        ],
      },
      {
        heading: "Create the PDF",
        paragraphs: [
          "Add the JPG files to PDFNova's JPG to PDF tool and arrange them in reading order. Start the conversion, download the PDF, and open it in a viewer to confirm every image appears on the expected page.",
          "The PDF preserves the images as pages; it does not automatically turn photographed words into selectable text. Text recognition requires OCR, which is a separate process.",
        ],
      },
      {
        heading: "Balance clarity and file size",
        paragraphs: [
          "Camera images can make a surprisingly large PDF because modern phones capture far more pixels than a document needs for screen reading. If the output is too large, use PDF compression after confirming the original conversion looks correct.",
          "Keep the uncompressed version if the document may be printed or archived. Use the smaller copy for routine uploads and email, where speed and attachment limits matter more.",
        ],
      },
      {
        heading: "When a PDF is better than separate images",
        paragraphs: [
          "A PDF is usually the better format for multi-page records, applications, portfolios, and expense evidence because the order is fixed. Separate JPGs are useful when each picture must be reused or edited independently.",
          "Choose based on the recipient's instructions. Some portals require one PDF, while others provide one upload field per image. The correct format is the one the destination can accept reliably.",
        ],
      },
    ],
  },
  {
    slug: "are-online-pdf-tools-safe",
    title: "Are online PDF tools safe? What to check before adding a file",
    excerpt:
      "Understand local and server processing, sensitive-document risks, and the checks to make before using any browser PDF tool.",
    publishedAt: "2026-07-16",
    category: "Privacy",
    readingTime: 7,
    visual: "privacy",
    tool: {
      href: "/privacy",
      label: "Read our privacy policy",
      description: "See how PDFNova handles files and which operations may use a server.",
    },
    introduction: [
      "The phrase “online PDF tool” can describe two very different systems. One downloads code to your browser and processes the file on your device. The other uploads the document to a remote service, processes it there, and sends back a result. The interface may look identical, but the privacy implications are not.",
      "Safety is not a single badge or promise. It depends on the document, the processing method, the provider's practices, and the rules that apply to your work. A public brochure and an unredacted medical record should not be treated the same way.",
    ],
    sections: [
      {
        heading: "Find out where processing happens",
        paragraphs: [
          "Look for a plain explanation near the tool or in its privacy policy. Local processing means the operation occurs in your browser's memory. Server processing means the file must leave your device, even when the connection is encrypted.",
          "Many PDFNova tools—including merge, split, rotate, watermark, and image conversion—run locally. Some conversions that need specialised software may use a server. Check the message on the specific tool instead of assuming every feature behaves the same way.",
        ],
      },
      {
        heading: "Match the tool to the sensitivity of the document",
        paragraphs: [
          "Consider what could happen if the file were exposed. Documents containing passwords, private keys, complete financial records, medical details, confidential legal material, or government identifiers deserve the strictest handling.",
          "Your employer, client, school, or regulator may also prohibit third-party processing. In that case, a convenient consumer tool is not a substitute for an approved workflow, even if the provider has strong security controls.",
        ],
        bullets: [
          "Remove pages and fields the recipient does not need.",
          "Prefer local processing for confidential material when policy allows it.",
          "Use an approved offline application when required.",
          "Avoid public or shared computers for sensitive documents.",
        ],
      },
      {
        heading: "Check the site before you upload",
        paragraphs: [
          "Confirm that the address is correct and uses HTTPS. Read how long uploaded files are retained, whether they are used for other purposes, and how deletion works. Be cautious of clones, misleading download buttons, and pages that ask for unrelated browser permissions.",
          "After downloading a result, store it in the correct location and delete unnecessary local copies. Security includes what happens before and after the conversion, not only the few seconds spent inside the tool.",
        ],
      },
      {
        heading: "A sensible default workflow",
        paragraphs: [
          "Classify the document first. For ordinary, non-sensitive files, a reputable browser tool with clear processing information can be a practical option. For confidential files, minimise the content, prefer local or approved offline processing, and follow the policy that governs the data.",
          "If you cannot determine where a tool sends a file or how it is handled, pause. Uncertainty is a useful signal to choose a more transparent workflow.",
        ],
      },
    ],
  },
  {
    slug: "pdf-workflow-for-students",
    title: "A simple PDF workflow for notes, assignments, and study packs",
    excerpt:
      "Organise class material, combine scans, extract chapters, and submit smaller files with a repeatable student workflow.",
    publishedAt: "2026-07-09",
    category: "Productivity",
    readingTime: 6,
    visual: "study",
    tool: {
      href: "/merge-pdf",
      label: "Build a study pack",
      description: "Combine notes and handouts into a single, ordered PDF.",
    },
    introduction: [
      "PDFs pile up quickly during a term: lecture slides, scanned notes, reading lists, assignment briefs, and journal articles all arrive with different names and page layouts. A small weekly routine keeps that material searchable and reduces last-minute submission problems.",
      "The best workflow is deliberately simple. Use consistent names, keep untouched originals, and create smaller purpose-built PDFs for each task rather than repeatedly editing one giant file.",
    ],
    sections: [
      {
        heading: "Start with a predictable folder and file names",
        paragraphs: [
          "Create one folder per module, then organise by week or topic. Begin file names with a date or week number so normal alphabetical sorting also becomes chronological sorting.",
          "A name like week-04-cell-biology-notes.pdf tells you more than scan0047.pdf. Add labels such as original, annotated, or submitted when multiple versions serve different purposes.",
        ],
      },
      {
        heading: "Turn loose material into focused study packs",
        paragraphs: [
          "Merge the lecture slides, your notes, and the relevant handout for one topic into a single PDF. Put the course material first and your notes immediately after it, or choose another order you can repeat every week.",
          "For a long textbook or reader, extract only the assigned chapter. Smaller files open faster on phones and make it less tempting to drift into unrelated material during a study session.",
        ],
        bullets: [
          "Merge related documents into one topic pack.",
          "Split long readers to keep only assigned pages.",
          "Rotate phone scans before adding them.",
          "Compress the final copy when a learning portal has a size limit.",
        ],
      },
      {
        heading: "Prepare assignments from the source, not the last PDF",
        paragraphs: [
          "Keep the editable Word, spreadsheet, or slide file as your source of truth. Export a fresh PDF for submission after the final edit. Repeatedly converting a PDF back and forth can alter fonts, spacing, links, and page breaks.",
          "Open the exported PDF and check every page before uploading. Pay special attention to equations, citations, charts, page numbers, and any content close to the page edge.",
        ],
      },
      {
        heading: "Use a final submission checklist",
        paragraphs: [
          "Confirm the required format, file-size limit, naming convention, and page count. Make sure tracked changes and private comments are absent from the submitted version. Upload early enough to download the portal copy and verify it.",
          "Keep the exact submitted PDF and the confirmation receipt together. That small habit gives you a reliable record if the portal preview changes or a submission question appears later.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return BLOG_POSTS.filter((candidate) => candidate.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, limit);
}

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
