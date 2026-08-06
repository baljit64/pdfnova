/**
 * Per-tool source copy. Everything specific and factual about a tool lives here
 * once; variations in `variations.ts` add their own angle on top.
 *
 * Keep this honest — a landing page that overpromises is worse than no page.
 */
import type { ToolId } from "../../tools/types";
import type { ContentBlock, FaqItem, ListItem } from "./types";

export interface ToolContent {
  /** Two paragraphs introducing the tool itself. */
  intro: string[];
  /** Tool-specific advantages, merged with the variation's own list. */
  benefits: ListItem[];
  steps: ListItem[];
  features: ListItem[];
  useCases: ListItem[];
  faqs: FaqItem[];
  /** How the tool works under the hood — real detail, not marketing. */
  technical: ContentBlock;
  /** An honest statement of what the tool will not do. */
  limitations: string;
}

export const TOOL_CONTENT: Record<ToolId, ToolContent> = {
  "merge-pdf": {
    intro: [
      "Merging PDFs is one of those jobs that sounds trivial until you actually need to do it. A signed contract arrives as one file, the annexes as three more, the cover letter as a fifth, and the person you are sending it to wants a single document. PDFNova's merge tool takes all of those files, keeps them in the order you set, and hands back one PDF with every page intact.",
      "You are not limited to two files. Add up to thirty at once, drag them into the order you want, rotate any that came in sideways, and remove anything you picked by mistake before you commit. The page content itself is copied across untouched — text stays selectable, links stay clickable, and embedded fonts travel with the pages they belong to.",
    ],
    benefits: [
      {
        title: "The order is yours to set",
        body: "Files are combined in the order shown on screen, not the order your operating system happened to hand them over. Move any file up or down until the sequence matches the document you have in mind.",
      },
      {
        title: "Nothing is re-encoded",
        body: "Pages are copied between documents rather than rasterised, so text remains searchable and selectable, vector graphics stay sharp at any zoom, and the merged file does not balloon in size.",
      },
      {
        title: "Fix orientation as you go",
        body: "If one of the source files was scanned sideways, rotate it in the file list before merging instead of running a second tool afterwards.",
      },
    ],
    steps: [
      {
        title: "Add your PDF files",
        body: "Drag them onto the upload area or press it to open your file browser. You can add files in several goes — each new selection is appended to the list.",
      },
      {
        title: "Put them in order",
        body: "Use the up and down controls beside each file. The number shown on the left is the position that file will take in the finished document.",
      },
      {
        title: "Rotate anything that needs it",
        body: "Press the rotate button beside a file to turn all of its pages 90 degrees at a time. The angle shown is what will be applied when you merge.",
      },
      {
        title: "Merge and preview",
        body: "Press Merge PDFs. The combined document appears in a viewer so you can scroll through it and confirm the order before committing to anything.",
      },
      {
        title: "Download the result",
        body: "Press the download button to save merged.pdf. If the order is wrong, start over and rearrange — nothing has been sent anywhere.",
      },
    ],
    features: [
      { title: "Up to 30 files", body: "Combine as many as thirty PDFs in a single pass, each up to 100 MB." },
      { title: "Drag and drop", body: "Drop files straight from your desktop, or use the keyboard to open the picker." },
      { title: "Per-file rotation", body: "Apply 90, 180 or 270 degrees to any file before it joins the merge." },
      { title: "Live preview", body: "Read the merged document in the browser before you download it." },
      { title: "Original quality", body: "Pages are copied, not re-rendered, so nothing is downgraded." },
    ],
    useCases: [
      {
        title: "Assembling a contract pack",
        body: "Put the agreement, the schedules and the signed signature page into one file so the other side receives a single, complete document rather than an email full of attachments.",
      },
      {
        title: "Submitting an application",
        body: "Visa, university and grant portals frequently accept one upload per section. Merging your certificates, transcripts and identity documents into a single PDF gets you past that limit.",
      },
      {
        title: "Combining scanned pages",
        body: "Scanners often produce one file per page. Merge them back into the document they came from, rotating any that were fed in the wrong way round.",
      },
      {
        title: "Building a report",
        body: "Stitch a cover page, a body exported from your word processor, and appendices from other people into one deliverable.",
      },
    ],
    faqs: [
      {
        question: "How many PDFs can I merge at once?",
        answer:
          "Up to thirty files in a single pass, with each file up to 100 MB. If you have more than that, merge in batches and then merge the batches — the result is identical.",
      },
      {
        question: "Will merging reduce the quality of my pages?",
        answer:
          "No. The tool copies page objects from the source documents into a new document rather than re-rendering them. Text stays text, images keep their original resolution, and vector artwork stays sharp.",
      },
      {
        question: "Can I change the order after I have added the files?",
        answer:
          "Yes. Each file in the list has up and down controls, and the number beside it shows where it will land in the finished PDF. Reorder as much as you like before pressing merge.",
      },
      {
        question: "What happens to bookmarks and form fields?",
        answer:
          "Page content, text and images are carried across faithfully. Document-level features such as bookmarks, the table of contents and interactive form fields are not currently preserved in the merged file.",
      },
      {
        question: "Can I merge a password-protected PDF?",
        answer:
          "Not while it is still encrypted. Open it in your PDF reader, save an unprotected copy, and merge that. This is deliberate — the tool will not attempt to bypass a password.",
      },
    ],
    technical: {
      heading: "How the merge actually works",
      paragraphs: [
        "When you press merge, each file is read into memory as an array of bytes and parsed with pdf-lib, an open-source PDF library that runs entirely in JavaScript. The tool creates an empty destination document and then copies page objects out of each source document into it, in the order you set on screen.",
        "Copying at the object level is what preserves quality. A page's text runs, embedded fonts, images and vector instructions are transferred as-is rather than being flattened into a picture. Rotation, when you apply it, is written as a page attribute on top of whatever rotation the page already carried, so a page that was already 90 degrees out and gets another 90 ends up at 180 rather than snapping back to zero.",
      ],
    },
    limitations:
      "Bookmarks, interactive form fields and document-level JavaScript are not carried into the merged file, and encrypted PDFs must be unlocked in your own reader first.",
  },

  "split-pdf": {
    intro: [
      "Splitting a PDF means one of two quite different things depending on the day. Sometimes you want every page as its own file — useful when a scanner has handed you a fifty-page batch that is really fifty separate documents. Other times you want to pull out pages seven through twelve and nothing else. This tool does both.",
      "Choose one PDF per page and you get a numbered set of single-page files, each named after the original. Choose a page range and you get one new PDF containing exactly the pages you listed, in the order you listed them. Either way the original file on your device is left completely untouched.",
    ],
    benefits: [
      {
        title: "Two modes, one tool",
        body: "Burst a document into single pages, or extract a specific range into one new file, without switching to a different page.",
      },
      {
        title: "Readable page ranges",
        body: "Write ranges the way you would say them out loud — 1-3, 7, 9-12 — and the tool validates them against the real page count before it does anything.",
      },
      {
        title: "Predictable filenames",
        body: "Output files are named after the source document with the page number appended, so a folder full of them still makes sense a month later.",
      },
    ],
    steps: [
      { title: "Add your PDF", body: "Drop a single PDF onto the upload area, or press it to browse your device." },
      {
        title: "Choose how to split",
        body: "Pick one PDF per page to burst the whole document, or extract a page range to pull out a specific section.",
      },
      {
        title: "Enter the pages you want",
        body: "If you chose to extract a range, type it as a list — 1-3, 7, 9-12. Page numbers start at 1 and each page appears only once in the output.",
      },
      { title: "Split the file", body: "Press Split PDF. Progress is shown page by page for long documents." },
      {
        title: "Download the pieces",
        body: "A single extracted range downloads as one file. A full burst gives you a list where you can grab pages individually or download the whole set.",
      },
    ],
    features: [
      { title: "Page-by-page burst", body: "Turn an N-page PDF into N separate single-page PDFs." },
      { title: "Range extraction", body: "Pull out any combination of pages and ranges into one new document." },
      { title: "Range validation", body: "Impossible ranges are reported before processing rather than failing halfway." },
      { title: "Cancel any time", body: "Long documents show live progress and can be stopped mid-run." },
      { title: "Original untouched", body: "The file you selected is only ever read, never modified." },
    ],
    useCases: [
      {
        title: "Separating a scan batch",
        body: "A stack fed through a document feeder often comes back as one PDF containing many unrelated documents. Burst it into pages, then keep only what you need.",
      },
      {
        title: "Sending one chapter",
        body: "Extract pages 42 to 58 of a long report so a colleague receives only the section that concerns them rather than the whole thing.",
      },
      {
        title: "Removing pages before sharing",
        body: "Extract everything except the pages you would rather not circulate, and share the new file instead of the original.",
      },
      {
        title: "Preparing pages for signature",
        body: "Pull the signature page out on its own, sign it, and merge it back into the document afterwards.",
      },
    ],
    faqs: [
      {
        question: "How do I write a page range?",
        answer:
          "Use commas between entries and hyphens inside a range, like 1-3, 7, 9-12. Spaces are ignored. Pages come out in the order you list them, and a page listed twice only appears once.",
      },
      {
        question: "What happens if I ask for a page that does not exist?",
        answer:
          "You get a clear message naming the page and telling you how many pages the document actually has, before any processing starts. Nothing is downloaded and nothing is lost.",
      },
      {
        question: "Does splitting change the pages themselves?",
        answer:
          "No. Each output page is copied from the original at the object level, so text, fonts, images and page dimensions are exactly as they were.",
      },
      {
        question: "Can I download all the split files at once?",
        answer:
          "Yes. The results view has a download-all button that saves every file in turn. Your browser may ask once for permission to download multiple files — allow it and the rest follow automatically.",
      },
      {
        question: "Is the original file changed?",
        answer:
          "Never. The tool reads the file you select and builds new documents from it. The file on your device is exactly as it was when you started.",
      },
    ],
    technical: {
      heading: "How splitting works",
      paragraphs: [
        "The source PDF is parsed once with pdf-lib and its page count is read. For a burst, the tool creates a fresh single-page document for each page index and copies that one page into it. For a range extraction, it creates a single document and copies the pages you listed into it in that order.",
        "Because pages are copied as objects rather than re-rendered, the output is byte-for-byte faithful to the input in terms of content. A page that was 2 MB of scanned image in the original is still that image in the split file — splitting is not a compression step, and a 50-page document split into 50 files will add up to roughly the size of the original plus a small amount of per-file structural overhead.",
      ],
    },
    limitations:
      "Splitting does not reduce file size, and document-level features such as bookmarks and form fields are not carried into the individual pieces.",
  },

  "compress-pdf": {
    intro: [
      "Almost every PDF that is too large is too large for the same reason: it contains page images at a far higher resolution than anyone will ever look at. A phone photo of a receipt dropped into a document can easily be 8 MB on its own. PDFNova's compressor attacks that directly, and it tells you honestly what it achieved.",
      "There are four levels. Lossless rewrites the file structure without touching a single page, which helps some documents and does nothing for others. Balanced and Strong re-render pages at a lower resolution and quality. Target size keeps trying progressively harder settings until the file fits the number you gave it, which is what you want when a portal refuses anything over 1 MB.",
    ],
    benefits: [
      {
        title: "A real size target",
        body: "Give the tool a number in kilobytes and it will keep trying harder settings until the output fits, rather than compressing once and leaving you to guess.",
      },
      {
        title: "It never makes things worse",
        body: "If aggressive compression produces a larger file than a simple structural rewrite, the smaller of the two is what you get. The result is never bigger than what a plain re-save would give you.",
      },
      {
        title: "Honest reporting",
        body: "You are shown the before and after size and the percentage saved. If a document was already well optimised and could not be improved, the tool says so instead of pretending.",
      },
    ],
    steps: [
      { title: "Add your PDF", body: "Drop in the file you need to shrink. Files up to 150 MB are accepted." },
      {
        title: "Pick a compression level",
        body: "Start with Balanced. Choose Lossless if the document must not be re-rendered at all, or Target size if you have a hard limit to meet.",
      },
      {
        title: "Set your target, if you have one",
        body: "With Target size selected, enter the ceiling in kilobytes. 1024 KB is about 1 MB, 500 KB is a common email-friendly limit.",
      },
      {
        title: "Compress",
        body: "Progress is reported page by page. Larger documents take longer because every page is re-rendered.",
      },
      {
        title: "Check the numbers and download",
        body: "The results panel shows the original size, the new size and the saving. Preview the document before downloading to confirm it is still readable.",
      },
    ],
    features: [
      { title: "Four levels", body: "Lossless, Balanced, Strong, and an iterative Target size mode." },
      { title: "Size targeting", body: "Six progressively stronger passes are tried until your target is met." },
      { title: "Before and after", body: "Every run reports the original size, final size and percentage saved." },
      { title: "Preview first", body: "Read the compressed document in the browser before you commit to it." },
      { title: "Cancel mid-run", body: "Stop a long compression at any point without leaving a partial file behind." },
    ],
    useCases: [
      {
        title: "Meeting an upload limit",
        body: "Government portals, job applications and court filing systems routinely cap uploads at 1, 2 or 5 MB. Target size mode exists for exactly this.",
      },
      {
        title: "Emailing a scanned document",
        body: "A scanned twenty-page contract can easily exceed 25 MB. Balanced compression usually brings it under a typical mail attachment limit while keeping it perfectly readable.",
      },
      {
        title: "Publishing to a website",
        body: "Smaller PDFs load faster for readers on mobile connections and cost you less bandwidth.",
      },
      {
        title: "Archiving a folder of documents",
        body: "Compressing before archiving keeps years of paperwork from filling a drive, at a quality level that is still fine to read.",
      },
    ],
    faqs: [
      {
        question: "How small can you make my PDF?",
        answer:
          "It depends entirely on what is in it. Scanned documents and image-heavy files often drop by 70 to 90 per cent. A text-only PDF exported from a word processor is already efficient and may barely change — the tool will tell you when that is the case rather than shipping a pointless file.",
      },
      {
        question: "Will the text still be selectable after compression?",
        answer:
          "With the Lossless level, yes — nothing about the page content changes. With Balanced, Strong or Target size, pages are re-rendered as images, so text becomes part of the picture and is no longer selectable or searchable. Choose Lossless if searchable text matters more than size.",
      },
      {
        question: "What does the target size mode actually do?",
        answer:
          "It tries a sequence of six settings, each combining a lower render resolution with a lower image quality. As soon as one produces a file at or under your target it stops and hands that back. If none of them reach the target, you get the smallest usable version along with a note saying the target was not met.",
      },
      {
        question: "Why did my file get no smaller?",
        answer:
          "Some PDFs are already optimised — text-only documents from Word or LaTeX typically are. In that case re-rendering would make the file larger, not smaller, so the tool keeps the better of the two results and tells you it could not improve on it.",
      },
      {
        question: "Are the page dimensions preserved?",
        answer:
          "Yes. Even when a page is re-rendered at a lower resolution, the output page keeps the original point size, so the document still prints at the correct physical dimensions.",
      },
    ],
    technical: {
      heading: "How compression works",
      paragraphs: [
        "The Lossless level loads the document with pdf-lib and re-saves it using cross-reference object streams. This packs the file's internal structure more tightly without altering any page content — useful for documents with a lot of structural bloat, neutral for everything else.",
        "The other levels take a different route. Each page is rendered to a canvas with pdf.js at a chosen scale, encoded as a JPEG at a chosen quality, and embedded into a fresh PDF at the original page dimensions. Target size mode walks through six scale-and-quality pairs from 1.5x at 82 per cent quality down to 0.55x at 34 per cent, stopping at the first one that meets your number. Whatever route is taken, the final output is compared against the plain lossless rewrite and the smaller of the two wins.",
      ],
    },
    limitations:
      "Any level other than Lossless converts page text into an image, which removes text selection, copy and paste, and searchability. Compression also cannot reduce a file below the size its content fundamentally requires.",
  },

  "rotate-pdf": {
    intro: [
      "A PDF that opens sideways is usually a scanner's fault. The page was fed in landscape, or the document feeder rotated it, and now everyone who opens the file has to tilt their head or rotate it in their reader every single time. Rotating in a reader does not fix it — the rotation is a view setting and is lost the moment the file is reopened elsewhere.",
      "This tool writes the rotation into the document itself. Turn every page, or just the ones that are wrong, by 90, 180 or 270 degrees, and download a file that opens the right way up for everybody, in every reader, forever.",
    ],
    benefits: [
      {
        title: "The rotation is permanent",
        body: "The angle is written into the PDF's page attributes, not into a viewer preference, so the file opens correctly everywhere it is sent.",
      },
      {
        title: "Rotate only what is wrong",
        body: "Leave the pages field blank to turn the whole document, or list specific pages when only some of them came out sideways.",
      },
      {
        title: "Rotation is cumulative",
        body: "The angle you choose is added to whatever rotation the page already had, so a page already 90 degrees out and rotated another 90 lands at 180 rather than snapping back to zero.",
      },
    ],
    steps: [
      { title: "Add your PDF", body: "Drop the file in or press the upload area to browse for it." },
      {
        title: "Choose the angle",
        body: "90 degrees clockwise fixes most scanner problems. 180 is for pages that are upside down. 270 is 90 degrees anticlockwise.",
      },
      {
        title: "Choose which pages",
        body: "Leave the pages field empty to rotate everything, or enter a list such as 2, 5-8 to rotate only those pages.",
      },
      { title: "Rotate", body: "Press Rotate PDF. The whole document is processed in one pass." },
      {
        title: "Check and download",
        body: "Read the result in the preview to confirm every page is the right way up, then download it.",
      },
    ],
    features: [
      { title: "Three angles", body: "90, 180 and 270 degrees, applied clockwise." },
      { title: "Selective pages", body: "Rotate the whole document or just the pages you name." },
      { title: "Additive rotation", body: "Builds on any rotation already stored in the page." },
      { title: "Content untouched", body: "Only the page rotation attribute changes — nothing is re-rendered." },
      { title: "Instant preview", body: "Confirm the orientation in the browser before downloading." },
    ],
    useCases: [
      {
        title: "Fixing a scanner's output",
        body: "Document feeders regularly rotate pages depending on how the paper was loaded. One pass through this tool corrects the whole batch.",
      },
      {
        title: "Correcting landscape spreads",
        body: "Wide tables and diagrams are often scanned in landscape inside an otherwise portrait document. Rotate just those pages and leave the rest alone.",
      },
      {
        title: "Preparing a document for print",
        body: "Print drivers respect the page rotation stored in the file, so fixing it here means the document comes out of the printer correctly oriented.",
      },
      {
        title: "Making a file readable on a phone",
        body: "Mobile PDF readers rarely offer a rotate control. Fixing the file itself is the only way to make it comfortable to read on a small screen.",
      },
    ],
    faqs: [
      {
        question: "Is the rotation saved into the file, or just how it looks here?",
        answer:
          "It is saved into the file. The angle is written to each page's rotation attribute in the PDF itself, which every compliant reader honours. This is the difference between rotating here and rotating in your PDF viewer, where the change is usually just a temporary view setting.",
      },
      {
        question: "Can I rotate only some pages?",
        answer:
          "Yes. Enter the pages in the pages field using the same format as a page range — 2, 5-8, for example. Any page you do not list keeps the orientation it already had.",
      },
      {
        question: "What if a page is already rotated?",
        answer:
          "The angle you pick is added to the page's existing rotation. A page already sitting at 90 degrees that you rotate by another 90 ends up at 180. This is almost always what you want when fixing a mixed batch.",
      },
      {
        question: "Does rotating change the quality or size of the file?",
        answer:
          "No. Rotation only sets a numeric attribute on each page — no content is re-rendered, re-encoded or resampled, and the file size is essentially unchanged.",
      },
      {
        question: "Can I rotate more than one PDF at a time?",
        answer:
          "This tool handles one document at a time so the page selection stays unambiguous. If you have several files that all need the same treatment, run them through one after another, or merge them first and rotate the combined document.",
      },
    ],
    technical: {
      heading: "How rotation works",
      paragraphs: [
        "Every page in a PDF carries a /Rotate entry: an integer of 0, 90, 180 or 270 that tells a reader how to turn the page before displaying it. This tool loads the document with pdf-lib, reads the existing value on each page you targeted, adds your chosen angle, wraps the result back into the 0 to 359 range, and writes it out.",
        "Because nothing but that integer changes, the operation is effectively free in both quality and file size. The text, images and vector content of the page are written back exactly as they were read — there is no rendering step anywhere in the process.",
      ],
    },
    limitations:
      "Rotation is applied per page in whole 90-degree steps; arbitrary angles and per-page previews of the current orientation are not available.",
  },

  watermark: {
    intro: [
      "A watermark says something about a document that the document itself does not: that it is a draft, that it is confidential, that it belongs to you, or that it is a copy rather than the original. Adding one before you circulate a file is a small habit that prevents a surprising number of misunderstandings.",
      "This tool stamps text across every page of a PDF. Choose the wording, how large it should be, how transparent, and where it sits — diagonally across the middle in the classic style, centred, or tucked into a corner where it will not obstruct the content.",
    ],
    benefits: [
      {
        title: "Every page, in one pass",
        body: "The stamp is applied to all pages, so a reader cannot end up with an unmarked page halfway through the document.",
      },
      {
        title: "Placement that respects the text",
        body: "Position is calculated from the actual width of your text at the size you chose, so long words stay on the page instead of running off the edge.",
      },
      {
        title: "Transparency you control",
        body: "Set the opacity anywhere from barely visible to solid, so the mark reads clearly without making the document underneath hard to follow.",
      },
    ],
    steps: [
      { title: "Add your PDF", body: "Drop in the document you want to mark." },
      {
        title: "Type the watermark text",
        body: "Common choices are DRAFT, CONFIDENTIAL, COPY, or your organisation's name. Standard Latin characters are supported.",
      },
      {
        title: "Choose the placement",
        body: "Diagonal across the middle is the traditional look. Centred, bottom right and top left are available when you need the content to stay legible.",
      },
      {
        title: "Set size and opacity",
        body: "48 point at 0.3 opacity is a good starting point for a full-page diagonal stamp. Drop the size for a corner mark.",
      },
      { title: "Apply and download", body: "Press Add watermark, check the preview, and download the marked document." },
    ],
    features: [
      { title: "Four placements", body: "Diagonal, centred, bottom right or top left." },
      { title: "Adjustable size", body: "Anything from 8 to 144 point." },
      { title: "Adjustable opacity", body: "From 0.05 for a whisper to 1.0 for a solid stamp." },
      { title: "All pages covered", body: "Applied to every page of the document automatically." },
      { title: "Text stays selectable", body: "The underlying document content is not flattened or re-rendered." },
    ],
    useCases: [
      {
        title: "Circulating a draft",
        body: "Marking a document DRAFT stops an unfinished version being mistaken for the final one when it gets forwarded on.",
      },
      {
        title: "Sharing confidential material",
        body: "A CONFIDENTIAL stamp is a visible reminder of how a document should be handled, and it survives printing and photocopying.",
      },
      {
        title: "Marking your own work",
        body: "Adding your name or your organisation's name makes it obvious where a document originated when it is shared onward.",
      },
      {
        title: "Distinguishing copies",
        body: "Stamp COPY on duplicates so the original signed version is never in doubt.",
      },
    ],
    faqs: [
      {
        question: "Can the watermark be removed by whoever receives the file?",
        answer:
          "The text is drawn into the page content stream, so it is not a layer that can simply be toggled off in a reader. Someone determined and technically capable could still edit it out with professional PDF software — treat a watermark as a clear signal of intent, not as a security control.",
      },
      {
        question: "Can I use an image or a logo as the watermark?",
        answer:
          "Not currently — this tool stamps text only. If you need a logo, one workable approach is to add it with the Edit PDF tool on the pages that matter most.",
      },
      {
        question: "Why were some characters dropped from my watermark?",
        answer:
          "The standard PDF fonts used here cover the Latin-1 character set. Characters outside that range, including most non-Latin scripts and some typographic punctuation, are removed rather than causing the whole operation to fail. Smart quotes and dashes are converted to their plain equivalents automatically.",
      },
      {
        question: "Will the watermark cover up my content?",
        answer:
          "That is what the opacity setting is for. At 0.3 the mark is clearly visible while the text underneath stays entirely readable. If you need the content completely unobstructed, choose a corner placement and a smaller size.",
      },
      {
        question: "Does watermarking change the rest of the document?",
        answer:
          "No. The text is drawn on top of each existing page. Everything already in the document — text, images, links — is left exactly as it was.",
      },
    ],
    technical: {
      heading: "How watermarking works",
      paragraphs: [
        "The document is loaded with pdf-lib and Helvetica Bold is embedded into it. For each page, the tool measures how wide your text will be at the chosen point size, then uses that measurement together with the page dimensions to work out a position that keeps the whole string on the page.",
        "The text is drawn into the page's content stream with the opacity and rotation you selected. Because this is a drawing operation rather than a re-render, everything already on the page is preserved exactly — the watermark is simply painted over the top of it.",
      ],
    },
    limitations:
      "Only text watermarks are supported, using Latin-1 characters, in a single colour, at one position per document.",
  },

  "sign-pdf": {
    intro: [
      "Most documents that need signing do not need a cryptographic certificate — they need a name on a line so the other party can see who agreed to what. Internal approvals, delivery notes, consent forms and simple agreements all fall into this category, and printing, signing and rescanning them is a waste of an afternoon.",
      "This tool types your signature onto the page in an italic face, draws a rule beneath it the way a printed signature block reads, and hands the document back. Sign the last page by default, or name any page in the document.",
    ],
    benefits: [
      {
        title: "No printing or scanning",
        body: "The signature goes straight onto the digital file, so the document never has to leave the screen and never loses quality to a scanner.",
      },
      {
        title: "It looks like a signature block",
        body: "The name is set in an italic face with a rule underneath, sized to the text, rather than being dropped onto the page as plain body copy.",
      },
      {
        title: "Sign any page",
        body: "Signature blocks are usually on the last page, which is the default, but you can name any page when yours is somewhere else.",
      },
    ],
    steps: [
      { title: "Add your PDF", body: "Drop in the document that needs signing." },
      { title: "Type your signature", body: "Enter your name as you want it to appear on the document." },
      {
        title: "Choose the page",
        body: "Leave the page at 0 to sign the last page, which is where signature blocks usually live, or enter a specific page number.",
      },
      { title: "Set the size", body: "16 point suits most documents. Increase it if the signature needs to stand out." },
      { title: "Sign and download", body: "Press Sign PDF, check the placement in the preview, and download the signed copy." },
    ],
    features: [
      { title: "Typed signature", body: "Set in Helvetica Oblique with a rule drawn beneath it." },
      { title: "Any page", body: "Sign the last page by default or specify one." },
      { title: "Adjustable size", body: "From 8 to 48 point." },
      { title: "Bottom-right placement", body: "Positioned where signature blocks conventionally sit." },
      { title: "Preview before download", body: "Confirm the placement before committing." },
    ],
    useCases: [
      {
        title: "Approving an internal document",
        body: "Sign off a policy, a purchase request or a timesheet without the print-sign-scan round trip.",
      },
      {
        title: "Returning a simple agreement",
        body: "Add your name to a straightforward contract and send it back the same day.",
      },
      {
        title: "Acknowledging receipt",
        body: "Sign a delivery note or handover document and return it as a PDF.",
      },
      {
        title: "Completing a consent form",
        body: "Fill in a school, medical or membership form and return it digitally.",
      },
    ],
    faqs: [
      {
        question: "Is this a legally binding electronic signature?",
        answer:
          "It is a typed signature, not a cryptographic digital signature backed by a certificate. Many jurisdictions accept typed signatures for everyday agreements where both parties intend to be bound, but this tool makes no legal guarantee. If you need a qualified electronic signature with an audit trail and identity verification, use a dedicated e-signature service.",
      },
      {
        question: "Can I draw my signature or upload an image of it?",
        answer:
          "Not yet — the tool currently places typed text. Drawn and image-based signatures are a planned addition.",
      },
      {
        question: "Where exactly is the signature placed?",
        answer:
          "At the bottom right of the chosen page, inset from the edge, with a horizontal rule drawn directly beneath it. The horizontal position is calculated from the width of your name so it never runs off the page.",
      },
      {
        question: "Can I sign more than one page?",
        answer:
          "One page per run. To sign several pages, run the tool again on the file you just downloaded, choosing a different page each time.",
      },
      {
        question: "Can other people tell the document was signed here?",
        answer:
          "No branding, watermark or metadata identifying this tool is added. The signed file contains your document and your signature and nothing else.",
      },
    ],
    technical: {
      heading: "How signing works",
      paragraphs: [
        "The document is loaded with pdf-lib and Helvetica Oblique is embedded. The tool measures the width of your name at the chosen point size, positions it so it sits inset from the right edge of the page with a guaranteed minimum left margin, and draws it into the page content stream.",
        "A thin horizontal line is then drawn immediately below the text, spanning exactly the width of the name. Nothing else on the page is altered, and the rest of the document is written back unchanged.",
      ],
    },
    limitations:
      "Typed signatures only, one page per run, with no cryptographic signing, certificate, timestamp or audit trail.",
  },

  "edit-pdf": {
    intro: [
      "PDFs are designed to be final, which is exactly the problem when a date is wrong, a reference number is missing, or a form needs a value typed into a box. Opening a full PDF editor for a change that small feels absurd, and most of them want a subscription first.",
      "This tool does one thing well: it places text at a position you specify on a page you specify. Give it the text, the page, the distance from the left edge and the distance from the top, and it writes that text into the document and gives you a new file.",
    ],
    benefits: [
      {
        title: "Coordinates you can reason about",
        body: "Vertical position is measured from the top of the page, which is how people actually read a page, rather than from the bottom as the PDF format does internally.",
      },
      {
        title: "The rest of the document is untouched",
        body: "Your text is drawn onto the existing page. Nothing is flattened, re-rendered or re-encoded, so the original content keeps its full quality.",
      },
      {
        title: "Repeatable",
        body: "Run the tool again on the file you just downloaded to add a second piece of text somewhere else.",
      },
    ],
    steps: [
      { title: "Add your PDF", body: "Drop in the document you want to change." },
      { title: "Type the text", body: "Enter exactly what should appear on the page." },
      { title: "Choose the page", body: "Page numbers start at 1. Out-of-range values are clamped to the nearest real page." },
      {
        title: "Set the position",
        body: "Distance from the left and distance from the top are both in points, where 72 points is one inch. A4 is roughly 595 by 842 points.",
      },
      { title: "Add and download", body: "Press Add text, check the placement in the preview, and adjust if it landed in the wrong spot." },
    ],
    features: [
      { title: "Point-accurate placement", body: "Position text anywhere on the page in PDF points." },
      { title: "Top-down coordinates", body: "Vertical distance is measured from the top edge, not the bottom." },
      { title: "Adjustable font size", body: "6 to 72 point in Helvetica." },
      { title: "Any page", body: "Target any page in the document by number." },
      { title: "Preview before download", body: "See exactly where the text landed before you save it." },
    ],
    useCases: [
      {
        title: "Correcting a small mistake",
        body: "Add a corrected reference number or date without going back to whoever produced the original file.",
      },
      {
        title: "Filling in a flat form",
        body: "Many PDF forms are just printed boxes with no interactive fields. Place text where the box is and the form is filled.",
      },
      {
        title: "Adding a note or reference",
        body: "Drop a case number, an internal reference or a short note onto a page before filing or forwarding it.",
      },
      {
        title: "Labelling a page",
        body: "Add a heading or a page label to a document that arrived without one.",
      },
    ],
    faqs: [
      {
        question: "Can I edit the text that is already in the PDF?",
        answer:
          "No. This tool adds new text on top of the page; it does not rewrite existing content. Editing text already in a PDF requires reflowing the original layout, which is a fundamentally harder problem and needs a full editor.",
      },
      {
        question: "How do the position numbers work?",
        answer:
          "Both are in PDF points, where 72 points equals one inch. Distance from the left is measured from the left edge of the page. Distance from the top is measured down from the top edge. An A4 page is about 595 points wide and 842 tall, so 50 from the left and 100 from the top puts text near the upper-left corner.",
      },
      {
        question: "The text landed in the wrong place. What now?",
        answer:
          "Nothing has been saved to your device unless you downloaded it, so just adjust the numbers and run it again. Increase the distance from the top to move text further down the page, and the distance from the left to move it right.",
      },
      {
        question: "Can I add images or shapes?",
        answer:
          "Not at the moment. Text placement is what this tool does. For a diagonal stamp across the whole page, the Watermark tool is a better fit.",
      },
      {
        question: "Why did some of my characters disappear?",
        answer:
          "The standard PDF fonts cover the Latin-1 range. Characters outside it are removed rather than failing the whole operation, and typographic quotes and dashes are converted to plain equivalents first.",
      },
    ],
    technical: {
      heading: "How text placement works",
      paragraphs: [
        "PDF page coordinates start at the bottom-left corner and increase upward, which is the opposite of how nearly everyone thinks about a page. The tool reads the page height and subtracts your distance-from-the-top value from it, so you can specify a position the way you would describe it out loud.",
        "Helvetica is embedded into the document and your text is drawn into the target page's content stream at the resulting coordinates. Everything already on the page stays exactly as it was — this is an additive drawing operation, not a re-render.",
      ],
    },
    limitations:
      "Existing text cannot be edited or removed, only new text added; images, shapes and freehand annotation are not supported, and text is placed as a single line with no automatic wrapping.",
  },

  "pdf-to-jpg": {
    intro: [
      "Turning PDF pages into JPG images is what you do when the destination will not take a PDF. Social posts, slide decks, chat apps, content management systems and image-only upload fields all want a picture, and a JPG is the format they all understand.",
      "This tool renders each page of your document at the resolution you choose and gives you one JPG per page. Pick screen resolution for something that will be viewed on a display, or print resolution when the image needs to hold up at full size.",
    ],
    benefits: [
      {
        title: "Choose your resolution",
        body: "Three presets from 72 dpi for screen use to 288 dpi for print, so you are not stuck with one compromise setting.",
      },
      {
        title: "Every page, individually",
        body: "Each page becomes its own numbered JPG, previewed as a thumbnail so you can grab only the pages you need.",
      },
      {
        title: "Adjustable quality",
        body: "The JPEG quality setting lets you trade file size against fidelity depending on where the images are going.",
      },
    ],
    steps: [
      { title: "Add your PDF", body: "Drop in the document you want to turn into images." },
      {
        title: "Choose the resolution",
        body: "Screen at 72 dpi keeps files small. High at 144 dpi suits most uses. Print at 288 dpi produces large, detailed images.",
      },
      {
        title: "Set the JPG quality",
        body: "0.92 is a good default. Lower it towards 0.6 for noticeably smaller files with some visible softening.",
      },
      { title: "Convert", body: "Progress is reported page by page, and long documents can be cancelled part-way." },
      {
        title: "Download the images",
        body: "Every page appears as a thumbnail. Download them one at a time, or use download all for the whole set.",
      },
    ],
    features: [
      { title: "Three resolutions", body: "72, 144 or 288 dpi equivalent." },
      { title: "Quality control", body: "JPEG quality adjustable from 0.4 to 1.0." },
      { title: "Thumbnail preview", body: "Every converted page shown before you download anything." },
      { title: "Per-page download", body: "Take the pages you need and ignore the rest." },
      { title: "White background", body: "Transparent regions are filled with white so JPGs never come out with black patches." },
    ],
    useCases: [
      {
        title: "Posting a page to social media",
        body: "Most platforms will not accept a PDF. Convert the page you want to share into an image and post that instead.",
      },
      {
        title: "Dropping a page into a slide deck",
        body: "Insert a page as a picture in a presentation without the formatting problems that come from copying and pasting.",
      },
      {
        title: "Uploading where only images are allowed",
        body: "Plenty of forms and portals accept JPG but not PDF, particularly for identity documents and proof of address.",
      },
      {
        title: "Previewing a document as thumbnails",
        body: "Generate page images to use as previews in a website, a listing or a catalogue.",
      },
    ],
    faqs: [
      {
        question: "What resolution should I choose?",
        answer:
          "Screen at 72 dpi is fine for something that will only ever be viewed on a monitor or phone. High at 144 dpi is the sensible default and looks sharp on modern displays. Print at 288 dpi is for images that will be printed or heavily zoomed, and produces much larger files.",
      },
      {
        question: "Can I convert only some pages?",
        answer:
          "The tool converts the whole document, but every page is shown separately in the results so you can download only the ones you want. If you would rather convert a subset, split the PDF first and convert the piece you extracted.",
      },
      {
        question: "Why is my JPG blurry?",
        answer:
          "Almost always the resolution setting. Screen resolution looks fine on a page-sized view but soft when enlarged. Convert again at High or Print resolution.",
      },
      {
        question: "Will the images have a white background?",
        answer:
          "Yes. JPEG has no transparency, so each page is rendered onto a white background first. This avoids the black patches you sometimes see from tools that skip that step.",
      },
      {
        question: "How large will the images be?",
        answer:
          "An A4 page at 144 dpi comes out around 1240 by 1754 pixels. At 288 dpi it is roughly double that in each direction, so about four times the pixels and a correspondingly larger file.",
      },
    ],
    technical: {
      heading: "How PDF to JPG works",
      paragraphs: [
        "Each page is rendered by pdf.js — the same rendering engine that displays PDFs inside Firefox — onto an HTML canvas at the scale you selected. A scale of 1 corresponds to 72 dpi, which is the PDF's native point resolution; a scale of 4 gives 288 dpi.",
        "Before the page is drawn, the canvas is filled with white so that transparent areas do not become black in the output. The canvas is then encoded to JPEG at your chosen quality and turned into a downloadable file. Canvases are released as soon as each page is encoded, which keeps memory in check on documents with many pages.",
      ],
    },
    limitations:
      "Images are produced page by page with no cropping or region selection, and text in the resulting JPGs is no longer selectable or searchable.",
  },

  "pdf-to-image": {
    intro: [
      "PNG is the format to reach for when a JPG will not do. It is lossless, so text edges stay crisp instead of picking up the soft halos that JPEG compression leaves around high-contrast lines, and it handles flat colour and line art far better than JPEG ever will.",
      "This tool renders each page of your PDF as a PNG at the resolution you choose. It is the right choice for diagrams, charts, screenshots, documents with fine text, and anything that will be edited further after conversion.",
    ],
    benefits: [
      {
        title: "Lossless output",
        body: "PNG compression discards nothing, so what you see is exactly what the renderer produced with no compression artefacts around text or lines.",
      },
      {
        title: "Better for line art",
        body: "Diagrams, charts and technical drawings keep clean edges instead of the softening JPEG applies to sharp transitions.",
      },
      {
        title: "Safe to edit further",
        body: "Because nothing is thrown away, a PNG can be cropped, annotated and re-saved repeatedly without degrading.",
      },
    ],
    steps: [
      { title: "Add your PDF", body: "Drop in the document you want to export." },
      {
        title: "Choose the resolution",
        body: "Screen at 72 dpi, High at 144 dpi, or Print at 288 dpi. PNG files are larger than JPGs at the same resolution.",
      },
      { title: "Convert", body: "Pages are rendered one at a time with progress shown throughout." },
      {
        title: "Review the thumbnails",
        body: "Every page appears in the results so you can check them before downloading.",
      },
      { title: "Download", body: "Save individual pages, or download the whole set at once." },
    ],
    features: [
      { title: "Lossless PNG", body: "No compression artefacts anywhere in the output." },
      { title: "Three resolutions", body: "72, 144 or 288 dpi equivalent." },
      { title: "White background", body: "Pages are rendered onto white for predictable, consistent output." },
      { title: "Thumbnail preview", body: "Check every page before you download it." },
      { title: "Per-page download", body: "Take only the pages you actually need." },
    ],
    useCases: [
      {
        title: "Exporting a diagram",
        body: "Technical drawings and charts keep their crisp lines in PNG, which JPEG compression would soften.",
      },
      {
        title: "Preparing an image for editing",
        body: "PNG is the better starting point when the page will be cropped, annotated or composited afterwards.",
      },
      {
        title: "Adding a page to documentation",
        body: "Documentation sites and wikis generally render PNG screenshots more cleanly than JPEGs.",
      },
      {
        title: "Archiving page images",
        body: "A lossless export preserves exactly what was rendered, which matters when the images are the record.",
      },
    ],
    faqs: [
      {
        question: "Should I choose PNG or JPG?",
        answer:
          "PNG for anything with text, line art, diagrams or flat colour, because it stays sharp. JPG for photographic content and whenever file size matters more than perfect edges. A page of body text will usually look noticeably better as a PNG.",
      },
      {
        question: "Why are PNG files so much larger than JPGs?",
        answer:
          "PNG is lossless — it reproduces every pixel exactly, whereas JPEG achieves its small sizes by discarding detail the eye is unlikely to miss. For a page of text the difference can be several times the file size, in exchange for noticeably cleaner text.",
      },
      {
        question: "Will the PNG have a transparent background?",
        answer:
          "No. Pages are rendered onto a white background so the output is consistent and predictable across viewers and editors.",
      },
      {
        question: "Can I convert a specific page only?",
        answer:
          "The whole document is converted, but each page is listed separately so you can download just the ones you want. To convert a subset only, split the PDF first.",
      },
      {
        question: "Is there a page limit?",
        answer:
          "There is no fixed limit, but every page is rendered and held as an image, so very long documents use a lot of memory. For documents over a few hundred pages, split first and convert in sections.",
      },
    ],
    technical: {
      heading: "How PDF to PNG works",
      paragraphs: [
        "Pages are rendered with pdf.js onto an HTML canvas at the scale you chose, where a scale of 1 equals the PDF's native 72 dpi. The canvas is pre-filled with white before rendering so that transparent regions produce white rather than black or undefined pixels.",
        "The canvas is then encoded to PNG, which stores the pixel data losslessly. Each canvas is discarded immediately after encoding so that memory does not accumulate across a long document.",
      ],
    },
    limitations:
      "Output is always opaque with a white background, produced whole-page at a time, and text in the resulting images is no longer selectable.",
  },

  "jpg-to-pdf": {
    intro: [
      "Photographs and scans arrive as separate image files, but almost everyone who asks for them wants a single document. Turning a folder of JPGs into one PDF is the difference between sending twelve attachments and sending one tidy file that opens in order.",
      "Add your images, arrange them into the sequence you want, and choose how they should sit on the page. Fit them onto A4 pages with margins for something that prints predictably, or size each page to its image exactly when the images are the point.",
    ],
    benefits: [
      {
        title: "You control the order",
        body: "Images are placed in the order shown on screen. Move them up and down until the sequence is right — the numbers tell you where each one lands.",
      },
      {
        title: "Two page strategies",
        body: "A4 with margins gives you a document that prints consistently. Match-the-image gives you a PDF with no cropping and no wasted space.",
      },
      {
        title: "Mixed formats welcome",
        body: "JPG and PNG can be combined in the same document, and mis-labelled files are detected and decoded correctly anyway.",
      },
    ],
    steps: [
      { title: "Add your images", body: "Drop in JPG or PNG files — up to sixty at a time, added in as many goes as you like." },
      { title: "Arrange them", body: "Use the up and down controls to set the page order, and remove anything you added by mistake." },
      {
        title: "Choose the page size",
        body: "A4 with margins scales each image to fit inside the page. Match-the-image makes each page exactly the size of its picture.",
      },
      {
        title: "Set orientation and margin",
        body: "Orientation can follow each image automatically or be forced to portrait or landscape. The margin applies to A4 pages only.",
      },
      { title: "Create and download", body: "Press Create PDF, read through the preview, and download the finished document." },
    ],
    features: [
      { title: "Up to 60 images", body: "Combine as many as sixty pictures into one document." },
      { title: "Reorderable", body: "Arrange the pages before you build the PDF." },
      { title: "A4 or image-sized pages", body: "Choose predictable printing or exact reproduction." },
      { title: "Auto orientation", body: "Each page can follow the shape of its own image." },
      { title: "Adjustable margins", body: "0 to 120 points of white space around each image." },
    ],
    useCases: [
      {
        title: "Turning phone photos into a document",
        body: "Photograph each page of a paper document and combine the pictures into a single PDF that can be emailed or uploaded as one file.",
      },
      {
        title: "Submitting supporting images",
        body: "Insurance claims, expense reports and applications often want one file. Combine your receipts and photographs into one PDF.",
      },
      {
        title: "Building a simple portfolio",
        body: "Arrange images in a deliberate order and produce a document that opens the same way for everybody.",
      },
      {
        title: "Archiving a set of scans",
        body: "Keep related images together as one file rather than as a folder that can be split up or partially lost.",
      },
    ],
    faqs: [
      {
        question: "Which image formats are supported?",
        answer:
          "JPG and PNG. If a file has the wrong extension — a JPEG named .png, which cameras and messaging apps do produce — the tool detects the mismatch and decodes it correctly instead of failing.",
      },
      {
        question: "What is the difference between the two page size options?",
        answer:
          "A4 with margins scales each image to fit inside a standard A4 page and centres it, which is what you want for anything that will be printed. Match-the-image makes each page exactly the pixel dimensions of its image, so nothing is scaled or cropped — better when the images are the content and printing is not the goal.",
      },
      {
        question: "Can I change the order of the images?",
        answer:
          "Yes. Every image in the list has up and down controls, and the number beside it is the page it will become. Rearrange as much as you like before creating the PDF.",
      },
      {
        question: "Will the images be compressed?",
        answer:
          "No. Images are embedded into the PDF in their original encoding, so the quality is exactly what you started with. If the result is too large, run it through the Compress PDF tool afterwards.",
      },
      {
        question: "Can I put more than one image on a page?",
        answer:
          "Not currently — the tool places one image per page. For a contact-sheet layout you would need to combine the images before converting.",
      },
    ],
    technical: {
      heading: "How image to PDF works",
      paragraphs: [
        "Each image is read as bytes and embedded into a new PDF document with pdf-lib, using the JPEG or PNG embedder as appropriate. If the first decoder rejects the file, the other one is tried before reporting an error, which handles files whose extension does not match their real format.",
        "In A4 mode the tool works out the largest scale at which the image fits inside the page minus your margins, then centres it. When orientation is set to follow the image, a picture wider than it is tall gets a landscape page. In match mode the page is created at the image's own pixel dimensions and the image is drawn edge to edge.",
      ],
    },
    limitations:
      "One image per page, JPG and PNG only, with no cropping, rotation or multi-image page layouts.",
  },

  "pdf-to-word": {
    intro: [
      "Getting a PDF back into an editable Word document is the hardest conversion on this site, and it is the only one that does not run on your own device. A PDF stores positioned glyphs, not paragraphs — reconstructing headings, columns, tables and lists from that requires layout analysis that browsers cannot reasonably do.",
      "This tool sends your file to a dedicated conversion service and returns a DOCX you can open in Word, Google Docs, LibreOffice or Pages. Because it leaves your device, this is the one PDFNova tool where the privacy story is different, and we would rather say so plainly than bury it.",
    ],
    benefits: [
      {
        title: "Genuinely editable output",
        body: "You get a real DOCX with flowing text you can edit, not a document with a picture of each page pasted into it.",
      },
      {
        title: "Structure is reconstructed",
        body: "Headings, paragraphs, lists and simple tables are rebuilt as Word structures rather than as absolutely positioned text boxes.",
      },
      {
        title: "Opens anywhere",
        body: "The DOCX format is read correctly by Microsoft Word, Google Docs, LibreOffice Writer and Apple Pages.",
      },
    ],
    steps: [
      { title: "Add your PDF", body: "Drop in the document you want to convert. The limit for this tool is 25 MB." },
      { title: "Start the conversion", body: "Press Convert to Word. Your file is sent to the conversion service over an encrypted connection." },
      { title: "Wait for processing", body: "Progress is shown while the service works. A long or complex document can take up to a minute." },
      { title: "Download the DOCX", body: "The finished document downloads with the same name as your PDF." },
      { title: "Check the layout", body: "Open it and review the result. Complex layouts almost always need some tidying up." },
    ],
    features: [
      { title: "True DOCX output", body: "A real Word document, not a PDF wrapped in one." },
      { title: "Structure recovery", body: "Headings, paragraphs, lists and simple tables are rebuilt." },
      { title: "Encrypted transfer", body: "Files travel over HTTPS to the conversion service and back." },
      { title: "Progress reporting", body: "Live status while the conversion runs, with no silent waiting." },
      { title: "Clear error messages", body: "If the service reports a problem, you see what it said rather than a generic failure." },
    ],
    useCases: [
      {
        title: "Reusing a document you no longer have the source for",
        body: "When the original file is gone and only the PDF survives, converting it back is faster than retyping.",
      },
      {
        title: "Updating a form or template",
        body: "Convert, edit the parts that changed, and export a fresh PDF.",
      },
      {
        title: "Extracting text at length",
        body: "Pulling several pages of prose out of a PDF is quicker through a conversion than through copy and paste.",
      },
      {
        title: "Collaborating in Word",
        body: "Turn a PDF into a document colleagues can comment on and track changes in.",
      },
    ],
    faqs: [
      {
        question: "Does this tool run on my device like the others?",
        answer:
          "No, and this is the one exception. PDF to Word requires layout analysis that is not practical in a browser, so your file is sent over an encrypted connection to a conversion service, converted there, and returned. Every other tool on PDFNova processes files entirely on your own device.",
      },
      {
        question: "How accurate is the conversion?",
        answer:
          "Straightforward documents — reports, letters, articles with a single column of text — convert very well. Multi-column layouts, complex tables, heavy graphic design and scanned pages are much harder, and you should expect to tidy up the result. No converter available anywhere is perfect at this.",
      },
      {
        question: "Will it work on a scanned PDF?",
        answer:
          "A scanned page is a photograph, so there is no text to recover unless the PDF has already had OCR applied to it. If your scan has no text layer, the conversion cannot produce editable text.",
      },
      {
        question: "Why is the file size limit lower for this tool?",
        answer:
          "Because the file has to travel to a conversion service and back. The 25 MB limit keeps conversions from timing out. If your document is larger, compress it first or split it and convert the sections separately.",
      },
      {
        question: "What if the conversion fails?",
        answer:
          "The error message from the service is shown as-is rather than hidden behind a generic failure, and a retry button is right there. If it fails repeatedly, the PDF may be encrypted or malformed — try opening and re-saving it in your PDF reader first.",
      },
    ],
    technical: {
      heading: "How PDF to Word works",
      paragraphs: [
        "Your file is posted to PDFNova's own API route, which forwards it to a document conversion service over an encrypted connection and polls that service until the job finishes. The resulting DOCX is streamed back through the same route to your browser, where it is turned into a download.",
        "The conversion itself involves interpreting the PDF's positioned text runs and reconstructing document structure from them — grouping glyphs into words and lines, lines into paragraphs, and detecting headings, lists and table cells from spacing and alignment. This inference is why simple layouts convert cleanly and complicated ones need review.",
      ],
    },
    limitations:
      "This tool sends your file to an external conversion service rather than processing it on your device; scanned PDFs without an existing text layer cannot be converted to editable text; and complex layouts require manual correction afterwards.",
  },

  "word-to-pdf": {
    intro: [
      "Sending a Word document to someone means hoping their fonts, their version of Word and their page setup match yours. Sending a PDF means it looks the same for everybody. That is why nearly every application form, submission portal and job posting asks for a PDF.",
      "This tool reads your DOCX, lays it out at A4 width, and paginates it properly across as many pages as it needs. The result is a PDF that opens identically wherever it lands.",
    ],
    benefits: [
      {
        title: "Proper pagination",
        body: "Long documents are split across as many A4 pages as they need rather than being squashed onto one page.",
      },
      {
        title: "Consistent appearance",
        body: "The layout is rendered once and fixed, so it does not shift depending on which fonts the recipient has installed.",
      },
      {
        title: "No account, no upload",
        body: "The conversion runs on your own device, so the document never leaves it.",
      },
    ],
    steps: [
      { title: "Add your Word file", body: "Drop in a DOC or DOCX file up to 40 MB." },
      { title: "Convert", body: "Press Convert to PDF. The document is rendered and paginated in your browser." },
      { title: "Wait for the pages", body: "Progress is reported per page. Long documents take proportionally longer." },
      { title: "Review the preview", body: "Read through the result to check the pagination before downloading." },
      { title: "Download the PDF", body: "The file is saved with the same name as the Word document." },
    ],
    features: [
      { title: "Multi-page output", body: "Automatic pagination across A4 pages with consistent margins." },
      { title: "DOCX and DOC", body: "Both Word formats are accepted." },
      { title: "Runs on your device", body: "No upload, no account, no server round trip." },
      { title: "A4 with margins", body: "20 mm margins on every side, matching standard document conventions." },
      { title: "Preview before download", body: "Check the pagination before you save the file." },
    ],
    useCases: [
      {
        title: "Sending a CV",
        body: "Employers and applicant tracking systems overwhelmingly prefer PDF, and it guarantees your layout survives the trip.",
      },
      {
        title: "Submitting an assignment",
        body: "Most academic submission systems require PDF so the formatting cannot shift between markers.",
      },
      {
        title: "Distributing a finished document",
        body: "A PDF signals that a document is final in a way an editable Word file does not.",
      },
      {
        title: "Archiving",
        body: "PDF is a far more stable long-term format than a Word file tied to a particular version of an application.",
      },
    ],
    faqs: [
      {
        question: "Will my formatting be preserved exactly?",
        answer:
          "Headings, paragraphs, lists, tables, bold and italic all come through. Highly customised layouts — text boxes, precise column arrangements, headers and footers, and unusual embedded fonts — may render differently, because the document is re-laid-out rather than read by Word itself.",
      },
      {
        question: "Does my document leave my device?",
        answer:
          "No. The DOCX is read, converted to HTML, rendered and turned into a PDF entirely inside your browser. Nothing is uploaded anywhere.",
      },
      {
        question: "Will long documents be split across pages correctly?",
        answer:
          "Yes. The rendered content is divided into A4-sized sections and each becomes its own page with consistent margins. Note that the split is by height, so a page break can occasionally land mid-paragraph.",
      },
      {
        question: "Is the text in the PDF selectable?",
        answer:
          "No. The document is rendered visually and each page is embedded as an image, so the output is a faithful picture of your document rather than a text-searchable PDF. If searchable text is essential, use the export-to-PDF function in Word itself.",
      },
      {
        question: "Are DOC files supported as well as DOCX?",
        answer:
          "DOCX is fully supported. The older binary DOC format is accepted but converts less reliably — if you have the option, save as DOCX first for a noticeably better result.",
      },
    ],
    technical: {
      heading: "How Word to PDF works",
      paragraphs: [
        "The DOCX is parsed by Mammoth, which converts the document's XML into semantic HTML — headings become heading elements, lists become list elements, and so on. That HTML is placed in an off-screen container sized to A4's content width so line breaks fall where they will in the finished PDF.",
        "The container is rendered to a canvas at 2x scale, then sliced into A4-page-height sections. Each slice is encoded as a JPEG and placed onto its own page with 20 mm margins. This slicing step is what produces correct multi-page output, and it is also why the resulting text is not selectable.",
      ],
    },
    limitations:
      "Output pages are images rather than selectable text, page breaks are determined by height and can fall mid-paragraph, and headers, footers and complex layout features are not reproduced.",
  },

  "excel-to-pdf": {
    intro: [
      "Spreadsheets are for working in; PDFs are for sending. The moment you share an XLSX you invite formula changes, broken references and version confusion, and the recipient sees whatever their own column widths and zoom level happen to be. A PDF of the same data is fixed, readable and safe to circulate.",
      "This tool reads your workbook and lays each sheet out as a properly formatted table with a header row, alternating row shading and sensible column widths. Convert every sheet in the workbook or just the first, in portrait or landscape.",
    ],
    benefits: [
      {
        title: "Every sheet, or just the first",
        body: "Multi-sheet workbooks are converted in full, with each sheet starting on its own page under its own name.",
      },
      {
        title: "Tables that are actually readable",
        body: "A styled header row, alternating row shading and automatic line wrapping inside cells, rather than a raw dump of values.",
      },
      {
        title: "CSV works too",
        body: "Plain CSV files are handled with the same layout treatment as full Excel workbooks.",
      },
    ],
    steps: [
      { title: "Add your spreadsheet", body: "Drop in an XLS, XLSX or CSV file up to 40 MB." },
      { title: "Choose the sheets", body: "Convert every sheet in the workbook, or stop after the first one." },
      {
        title: "Pick the orientation",
        body: "Landscape suits wide tables and is the default. Portrait works better for narrow ones.",
      },
      { title: "Convert", body: "Each sheet is laid out in turn with progress reported as it goes." },
      { title: "Review and download", body: "Check the table layout in the preview, then download the PDF." },
    ],
    features: [
      { title: "Multi-sheet support", body: "Every sheet converted, each starting on a new page with its name as a heading." },
      { title: "Styled tables", body: "Header row, alternating row shading and consistent cell padding." },
      { title: "Automatic wrapping", body: "Long cell values wrap rather than being cut off." },
      { title: "Both orientations", body: "Landscape or portrait A4." },
      { title: "XLS, XLSX and CSV", body: "All three spreadsheet formats accepted." },
    ],
    useCases: [
      {
        title: "Circulating a report",
        body: "Send figures as a PDF so nobody can accidentally edit a formula and change the numbers.",
      },
      {
        title: "Attaching data to a submission",
        body: "Many portals accept PDF only, so converting a data table is the only way to include it.",
      },
      {
        title: "Printing a clean table",
        body: "A converted PDF prints predictably, without the page-break surprises Excel is known for.",
      },
      {
        title: "Archiving a snapshot",
        body: "Freeze a set of figures at a point in time in a format that will still open in ten years.",
      },
    ],
    faqs: [
      {
        question: "Are charts and images in my spreadsheet converted?",
        answer:
          "No. This tool converts cell data into formatted tables. Charts, images, shapes and conditional formatting are not carried across. If you need a chart in the PDF, export it as an image and use the JPG to PDF tool.",
      },
      {
        question: "Are formulas converted, or their results?",
        answer:
          "Their results. The values as they appear in the spreadsheet are what goes into the PDF, which is almost always what you want when sharing.",
      },
      {
        question: "What happens with very wide tables?",
        answer:
          "Columns are fitted to the page width and long cell values wrap onto multiple lines within their cell. For tables with a great many columns, landscape orientation helps considerably. Extremely wide tables may still be cramped.",
      },
      {
        question: "Does it convert every sheet in the workbook?",
        answer:
          "That is your choice. Convert every sheet — each starting on a new page under its own name — or stop after the first. Empty sheets are skipped automatically.",
      },
      {
        question: "Does my spreadsheet get uploaded?",
        answer:
          "No. The workbook is parsed and the PDF is built entirely inside your browser. Nothing is sent anywhere.",
      },
    ],
    technical: {
      heading: "How Excel to PDF works",
      paragraphs: [
        "The workbook is parsed by SheetJS, which reads XLS, XLSX and CSV and exposes each sheet as a two-dimensional array of cell values. The first row of each sheet becomes the table header and the rest becomes the body.",
        "Those rows are handed to jsPDF's autoTable layout engine, which measures the content, works out column widths, applies the header and alternating-row styling, wraps long values inside their cells, and flows the table across as many pages as it needs. When you convert every sheet, each one starts on a fresh page with its name printed above the table.",
      ],
    },
    limitations:
      "Only cell values are converted — charts, images, shapes, conditional formatting and cell colours are not reproduced — and very wide tables can become cramped even in landscape.",
  },
};

export function getToolContent(id: ToolId): ToolContent {
  return TOOL_CONTENT[id];
}
