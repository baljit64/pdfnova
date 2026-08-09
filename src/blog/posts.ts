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
  {
    slug: "convert-pdf-to-word-without-formatting-problems",
    title: "How to convert PDF to Word without creating a formatting mess",
    excerpt:
      "Learn what converts cleanly, what usually needs repair, and how to review a new Word document before editing it.",
    publishedAt: "2026-07-02",
    category: "Guides",
    readingTime: 6,
    visual: "study",
    tool: {
      href: "/pdf-to-word",
      label: "Convert PDF to Word",
      description: "Turn a PDF into an editable Word document and download the DOCX result.",
    },
    introduction: [
      "A PDF is designed to preserve a finished page, while a Word document is designed to let content move as you edit it. Converting between them means reconstructing paragraphs, headings, tables, and images from their positions on the PDF page. That is why a converted file can look right at first glance but behave differently when you start typing.",
      "The cleanest results come from text-based PDFs with a simple layout. Scans, forms, multi-column reports, and heavily designed brochures require more review. A good conversion workflow sets the right expectations and protects the original file.",
    ],
    sections: [
      {
        heading: "Check what kind of PDF you have",
        paragraphs: [
          "Try selecting a sentence in your PDF viewer. If individual words can be highlighted, the document probably contains real text and is a strong candidate for conversion. If the whole page behaves like one picture, it is a scan and may need optical character recognition before the words become editable.",
          "Simple reports, letters, and single-column documents usually convert more predictably than newsletters, forms, and pages where text wraps around several images. Password restrictions can also prevent conversion until the document owner provides an accessible copy.",
        ],
      },
      {
        heading: "Convert and preserve the original",
        paragraphs: [
          "Open PDFNova's PDF to Word tool, add the PDF, and start the conversion. Download the DOCX into a separate working folder rather than saving over an earlier editable source. The PDF should remain your visual reference while you repair and edit the Word copy.",
        ],
        bullets: [
          "Keep the source PDF unchanged.",
          "Give the DOCX a clear working-version name.",
          "Compare page count and major headings first.",
          "Save a new PDF after editing and review that export too.",
        ],
      },
      {
        heading: "Review the parts most likely to shift",
        paragraphs: [
          "Inspect tables, columns, footnotes, page breaks, headers, bullet indentation, and text placed over images. These elements depend heavily on page geometry and can be rebuilt with extra text boxes or manual spacing during conversion.",
          "Turn on Word's formatting marks when a paragraph refuses to move normally. Hidden line breaks, tabs, and section breaks are easier to fix when you can see them. Replace repeated spaces with proper paragraph and table formatting instead of nudging content into place.",
        ],
      },
      {
        heading: "Know when to rebuild instead",
        paragraphs: [
          "For a short, highly designed PDF, rebuilding the page in Word can be faster than repairing dozens of positioned elements. For a long text document, conversion usually saves substantial retyping even when headings and tables need attention.",
          "Treat the converted document as a new editable draft, not a perfect recovery of the original source. Before sharing, run spelling checks, test links, inspect accessibility, and export a fresh PDF to confirm the final pages still look correct.",
        ],
      },
    ],
  },
  {
    slug: "rotate-pdf-pages-permanently",
    title: "How to rotate PDF pages permanently and fix sideways scans",
    excerpt:
      "Correct one page or an entire document so the orientation stays fixed when the PDF is reopened or shared.",
    publishedAt: "2026-06-25",
    category: "Guides",
    readingTime: 5,
    visual: "split",
    tool: {
      href: "/rotate-pdf",
      label: "Rotate PDF pages",
      description: "Rotate all pages or enter selected page numbers and save a corrected PDF.",
    },
    introduction: [
      "The rotate button in a PDF viewer often changes only your current view. Close the file, send it to someone else, or open it in another app and the page may be sideways again. Permanent rotation saves the orientation into the PDF itself.",
      "This is particularly useful for phone scans and mixed document batches where one landscape page sits among portrait pages. Fixing orientation before merging, signing, or submitting the file prevents mistakes later in the workflow.",
    ],
    sections: [
      {
        heading: "View rotation and saved rotation are different",
        paragraphs: [
          "Viewer rotation is a temporary convenience. It helps you read the page without necessarily changing the document. A rotate-PDF tool creates a new file whose pages contain the corrected orientation, so another reader sees the same result.",
          "If your viewer offers a Save command after rotating, it may preserve the change, but behaviour differs between applications. Creating a separate corrected copy is easier to verify and keeps the original available if the wrong pages were selected.",
        ],
      },
      {
        heading: "Rotate all pages or selected pages",
        paragraphs: [
          "Add the file to PDFNova's Rotate PDF tool and choose 90, 180, or 270 degrees. Leave the page field empty to rotate the whole document, or enter specific pages and ranges when only part of the file is sideways.",
        ],
        bullets: [
          "Use 90 degrees for a quarter-turn clockwise.",
          "Use 180 degrees for upside-down pages.",
          "Use 270 degrees for a quarter-turn anticlockwise.",
          "Enter a list such as 2, 5-8 to change selected pages only.",
        ],
      },
      {
        heading: "Check mixed-orientation documents carefully",
        paragraphs: [
          "A landscape chart can be intentionally wider than it is tall, so do not rotate every non-portrait page automatically. Judge orientation by the direction of its readable content rather than the shape of the page.",
          "After processing, scan the page thumbnails from beginning to end. Then open the corrected pages at full size to ensure text, annotations, and form fields remain where expected.",
        ],
      },
      {
        heading: "Rotate early in the workflow",
        paragraphs: [
          "Correct pages before adding a watermark or visible signature, because those additions are positioned using the page orientation at that moment. Rotating afterward can leave the new content facing the wrong way or sitting in an awkward location.",
          "If several files will be merged, correct each source first and then combine them. The final review becomes much simpler when every input is already readable.",
        ],
      },
    ],
  },
  {
    slug: "add-watermark-to-pdf-professionally",
    title: "How to add a professional watermark to a PDF",
    excerpt:
      "Choose useful watermark text, placement, size, and opacity without making the document difficult to read.",
    publishedAt: "2026-06-18",
    category: "Guides",
    readingTime: 5,
    visual: "privacy",
    tool: {
      href: "/watermark",
      label: "Add a PDF watermark",
      description: "Stamp custom text across every page with adjustable placement and opacity.",
    },
    introduction: [
      "A watermark communicates status or ownership without replacing the document's actual content. Labels such as DRAFT, CONFIDENTIAL, SAMPLE, and REVIEW COPY help readers understand how a file should be handled.",
      "The most effective watermark is noticeable but not disruptive. Oversized solid text can hide signatures and figures, while a tiny pale label can be missed entirely. Placement and contrast should reflect the document's purpose.",
    ],
    sections: [
      {
        heading: "Use specific, meaningful text",
        paragraphs: [
          "Choose a short phrase that tells the reader what the mark means. DRAFT—NOT FOR APPROVAL is clearer than DRAFT when a document is circulating for comments. A client or project name can make a review copy easier to trace.",
          "Do not place secrets in the watermark itself. The text appears on every processed page and may become visible in screenshots, printouts, and extracted pages.",
        ],
      },
      {
        heading: "Balance placement and opacity",
        paragraphs: [
          "A diagonal watermark across the centre is difficult to overlook and suits drafts or samples. A corner mark is less intrusive and works for ownership or filing labels. Start with moderate transparency, then inspect pages with both light and dark content.",
        ],
        bullets: [
          "Keep the phrase short enough to fit cleanly.",
          "Use diagonal placement for prominent status labels.",
          "Use a corner when the mark should be discreet.",
          "Check that charts, signatures, and small text remain readable.",
        ],
      },
      {
        heading: "Add the watermark to a final copy",
        paragraphs: [
          "Finish merging, splitting, and rotating pages before watermarking. Then add the clean final PDF to the Watermark tool, enter the label, choose its position, size, and opacity, and download the marked copy.",
          "Keep an unwatermarked master separately. If the document status changes from draft to approved, you can create a new distribution copy without trying to remove a mark from an already processed file.",
        ],
      },
      {
        heading: "Understand what a watermark cannot do",
        paragraphs: [
          "A visible watermark discourages casual reuse and communicates handling instructions, but it is not access control. It does not encrypt the PDF, prevent copying, prove who opened it, or guarantee confidentiality.",
          "For sensitive documents, combine clear labelling with an approved secure sharing method and appropriate permissions. The watermark is one communication layer inside a broader document policy.",
        ],
      },
    ],
  },
  {
    slug: "add-signature-to-pdf-online",
    title: "How to add a visible signature to a PDF before sending it",
    excerpt:
      "Prepare the document, place a typed signature carefully, and understand when a basic visible signature is not enough.",
    publishedAt: "2026-06-11",
    category: "Productivity",
    readingTime: 6,
    visual: "privacy",
    tool: {
      href: "/sign-pdf",
      label: "Add a signature",
      description: "Place a typed signature on a selected PDF page and download the signed copy.",
    },
    introduction: [
      "Adding your name to a signature line can complete many routine forms, approvals, and acknowledgements. Before you sign, make sure the document is the final version and that you understand what the recipient expects.",
      "PDFNova's Sign PDF tool adds a visible typed signature to a page. It does not issue a certificate-backed digital signature or create an identity audit trail. Those distinctions matter for contracts and regulated workflows.",
    ],
    sections: [
      {
        heading: "Review the complete document first",
        paragraphs: [
          "Read every page, confirm names and dates, and make sure blank fields are handled correctly. Check that no page is missing and that the signature page belongs to the same version you reviewed.",
          "If the document needs edits, make them before signing and produce a clean final PDF. Changing content after a signature is added can create confusion about what was accepted.",
        ],
      },
      {
        heading: "Place the visible signature",
        paragraphs: [
          "Open the Sign PDF tool, add the document, type your full name, and select the intended page. Choose a readable size and position that fits the signature area without covering dates, checkboxes, or nearby text. Process the file and download the result.",
        ],
        bullets: [
          "Use the name expected by the receiving party.",
          "Double-check the selected page number.",
          "Leave space for the date or countersignature.",
          "Open the downloaded PDF and inspect the final placement.",
        ],
      },
      {
        heading: "Know which kind of signature is required",
        paragraphs: [
          "A visible typed name may be accepted for an informal approval or internal form, but some transactions require a dedicated electronic-signature platform, verified identity, timestamps, certificates, witnesses, or a full audit trail.",
          "Requirements vary by organisation, document, and jurisdiction. Ask the recipient or obtain appropriate professional guidance when validity is important. A signature that looks correct on the page is not automatically equivalent to every legal form of signing.",
        ],
      },
      {
        heading: "Store and share the signed copy carefully",
        paragraphs: [
          "Give the file a descriptive name that identifies it as signed without losing the original title. Keep the unsigned final version and the signed version separately, along with any email or confirmation that records when it was delivered.",
          "Share the result through the channel requested by the recipient. If the document contains sensitive information, use an approved secure method rather than relying on the appearance of a signature for protection.",
        ],
      },
    ],
  },
  {
    slug: "convert-pdf-pages-to-jpg-images",
    title: "How to convert PDF pages to JPG images without blurry text",
    excerpt:
      "Export PDF pages for presentations, websites, and sharing while choosing a resolution that keeps details clear.",
    publishedAt: "2026-06-04",
    category: "Guides",
    readingTime: 5,
    visual: "images",
    tool: {
      href: "/pdf-to-jpg",
      label: "Convert PDF to JPG",
      description: "Render each PDF page as a separate JPG image in your browser.",
    },
    introduction: [
      "PDF is ideal for a complete document, but many slide editors, social platforms, content systems, and chat apps work more easily with images. Converting a page to JPG creates a flat visual copy that can be inserted almost anywhere.",
      "The tradeoff is that image text is no longer selectable and quality depends on resolution. Choose the output for its destination instead of automatically generating the largest possible image.",
    ],
    sections: [
      {
        heading: "Decide whether JPG is the right output",
        paragraphs: [
          "Use JPG when a PDF page contains photographs, when broad compatibility matters, or when a platform specifically asks for that format. PNG can be better for crisp diagrams, screenshots, transparency, and pages dominated by sharp text, though it may produce larger files.",
          "If the recipient needs to search, copy, print, or navigate the whole document, send the PDF instead. An image is best for displaying a page, not preserving every document feature.",
        ],
      },
      {
        heading: "Select a useful rendering scale",
        paragraphs: [
          "PDFNova lets you choose the scale used to render each page. A larger scale produces more pixels and clearer detail, but it also takes longer and creates bigger images. Start with a moderate scale for screen use and increase it only when small text is difficult to read.",
        ],
        bullets: [
          "Use a moderate scale for chat, previews, and slides.",
          "Use a higher scale for zooming or detailed diagrams.",
          "Inspect the smallest important text in the output.",
          "Keep the source PDF as the quality master.",
        ],
      },
      {
        heading: "Convert and organise the image files",
        paragraphs: [
          "Add the PDF, choose the JPG format and rendering scale, then start the conversion. Each page becomes a separate numbered image. Keep the page numbers in the file names so the original sequence remains obvious.",
          "If you only need two pages from a large PDF, extract those pages first. Converting a smaller purpose-built PDF reduces processing time and avoids creating images you will immediately delete.",
        ],
      },
      {
        heading: "Avoid repeated image conversion",
        paragraphs: [
          "JPG uses lossy compression. Opening and resaving the same image repeatedly can add visible blocks and soft edges around text. Return to the PDF and create a fresh export when you need a different size.",
          "For web publishing, resize the fresh image once to its final display dimensions and check it on a phone as well as a desktop. A page that looks sharp in a large editor window can become unreadable in a narrow feed.",
        ],
      },
    ],
  },
  {
    slug: "prepare-one-pdf-for-job-application",
    title: "How to prepare one polished PDF for a job application",
    excerpt:
      "Combine a cover letter, résumé, and supporting documents into a tidy file that recruiters can open and review quickly.",
    publishedAt: "2026-05-28",
    category: "Productivity",
    readingTime: 6,
    visual: "merge",
    tool: {
      href: "/merge-pdf",
      label: "Merge application PDFs",
      description: "Arrange your application documents and combine them into one ordered PDF.",
    },
    introduction: [
      "When an application portal provides one upload field for several documents, a combined PDF is easier to review than an archive or a loosely ordered set of files. The recruiter opens one attachment and sees the material in the sequence you intended.",
      "The content still matters most, but clean document preparation removes avoidable friction. Consistent page sizes, readable text, a sensible file name, and a small enough upload make the application feel considered.",
    ],
    sections: [
      {
        heading: "Follow the employer's instructions exactly",
        paragraphs: [
          "First confirm which documents are required, whether they must be separate, the accepted file formats, and the maximum size. Do not combine files when the portal has dedicated fields for a résumé, cover letter, and portfolio.",
          "Remove sensitive information that was not requested, such as complete identification numbers, banking details, or unrelated certificates. Include references only when the instructions ask for them.",
        ],
      },
      {
        heading: "Create a clear reading order",
        paragraphs: [
          "A common combined order is cover letter, résumé, then supporting certificates or work samples. Export each source to PDF, give the files numbered names, and add them to the merge tool. Drag them into the final sequence before processing.",
        ],
        bullets: [
          "Put the most role-specific document first.",
          "Remove accidental blank pages.",
          "Rotate scanned certificates upright.",
          "Check that every page belongs to this employer and role.",
        ],
      },
      {
        heading: "Review readability and consistency",
        paragraphs: [
          "Open the merged PDF and inspect it at normal zoom. Text should be selectable in documents exported from Word, links should work where appropriate, and scanned pages should be clear enough to read without extreme zooming.",
          "Mixed page sizes are usually acceptable, but abrupt orientation changes or enormous scanned pages make the file awkward to navigate. Correct those sources before creating the final merge.",
        ],
      },
      {
        heading: "Name, compress, and verify the upload",
        paragraphs: [
          "Use a professional name such as firstname-lastname-application.pdf. If the file exceeds the portal limit, compress a copy using the lightest setting that fits, then check small text and fine lines again.",
          "After uploading, use the portal preview or download option when available. Confirm that the correct final file is attached and keep a copy of exactly what you submitted with the confirmation message.",
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
