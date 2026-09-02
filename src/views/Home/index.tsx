"use client";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  Download,
  FileCheck2,
  LockKeyhole,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  WifiOff,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BLOG_POSTS, formatBlogDate } from "../../blog/posts";
import BlogArtwork from "../../components/blog/BlogArtwork";
import ToolCard from "../../components/tools/ToolCard";
import Container from "../../components/ui/Container";
import SectionHeading from "../../components/ui/SectionHeading";

type Category =
  | "All tools"
  | "Organize PDF"
  | "Optimize PDF"
  | "Convert from PDF"
  | "Convert to PDF"
  | "Edit PDF";

type HomeTool = {
  id: string;
  title: string;
  category: Exclude<Category, "All tools">;
  description: string;
  unavailable?: boolean;
};

const CATEGORIES: Category[] = [
  "All tools",
  "Organize PDF",
  "Optimize PDF",
  "Convert from PDF",
  "Convert to PDF",
  "Edit PDF",
];

const TOOLS: HomeTool[] = [
  { id: "merge-pdf", title: "Merge PDF", category: "Organize PDF", description: "Combine PDFs into one file in the exact order you choose." },
  { id: "split-pdf", title: "Split PDF", category: "Organize PDF", description: "Extract selected pages or create a separate PDF for each page." },
  { id: "compress-pdf", title: "Compress PDF", category: "Optimize PDF", description: "Reduce file size with balanced, strong, or target-size options." },
  { id: "rotate-pdf", title: "Rotate PDF", category: "Organize PDF", description: "Turn all or selected pages and save the corrected document." },
  { id: "pdf-to-word", title: "PDF to Word", category: "Convert from PDF", description: "Turn PDF content into an editable DOCX document." },
  { id: "word-to-pdf", title: "Word to PDF", category: "Convert to PDF", description: "Convert DOC and DOCX files into shareable PDF documents." },
  { id: "pdf-to-jpg", title: "PDF to JPG", category: "Convert from PDF", description: "Render selected PDF pages as clear JPG images." },
  { id: "pdf-to-image", title: "PDF to PNG", category: "Convert from PDF", description: "Export PDF pages as high-quality PNG image files." },
  { id: "jpg-to-pdf", title: "JPG to PDF", category: "Convert to PDF", description: "Arrange images and combine them into one polished PDF." },
  { id: "excel-to-pdf", title: "Excel to PDF", category: "Convert to PDF", description: "Lay out spreadsheet data as clean, readable PDF tables." },
  { id: "edit-pdf", title: "Edit PDF", category: "Edit PDF", description: "Add text and annotations to the page you choose." },
  { id: "sign-pdf", title: "Sign PDF", category: "Edit PDF", description: "Place a signature on a selected PDF page." },
  { id: "watermark", title: "Watermark PDF", category: "Edit PDF", description: "Add text or image watermarks with precise placement." },
  { id: "pdf-to-powerpoint", title: "PDF to PowerPoint", category: "Convert from PDF", description: "Turn PDF pages into an editable presentation.", unavailable: true },
  { id: "pdf-to-excel", title: "PDF to Excel", category: "Convert from PDF", description: "Extract PDF tables into spreadsheet-ready data.", unavailable: true },
  { id: "powerpoint-to-pdf", title: "PowerPoint to PDF", category: "Convert to PDF", description: "Convert presentations into dependable PDF files.", unavailable: true },
];

const POPULAR_IDS = ["merge-pdf", "compress-pdf", "pdf-to-word", "jpg-to-pdf", "split-pdf", "edit-pdf"];

export default function Home() {
  const [category, setCategory] = useState<Category>("All tools");
  const [query, setQuery] = useState("");

  const filteredTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      const matchesCategory = category === "All tools" || tool.category === category;
      const matchesQuery = !normalized || `${tool.title} ${tool.description}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const searchMatches = query.trim() ? filteredTools.slice(0, 5) : [];
  const popularTools = TOOLS.filter((tool) => POPULAR_IDS.includes(tool.id));

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCategory("All tools");
    document.getElementById("all-tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="overflow-hidden bg-white">
      <section className="relative isolate border-b border-[var(--border)] bg-[var(--page)] py-20 sm:py-24 lg:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(204,68,53,0.1),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(28,57,141,0.11),transparent_30%)]" />
        <div className="absolute left-1/2 top-16 -z-10 h-72 w-72 -translate-x-1/2 rounded-full border border-[var(--border)]/70 opacity-60" />
        <Container className="text-center">
          <span className="section-eyebrow gap-2 normal-case tracking-normal">
            <Sparkles className="h-3.5 w-3.5" /> Free, fast and privacy-first
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
            Free Online <span className="text-[var(--primary)]">PDF Tools</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
            Merge, split, compress, convert, edit and sign documents with focused tools that work
            right in your browser.
          </p>

          <form onSubmit={submitSearch} className="relative mx-auto mt-9 max-w-2xl text-left" id="tool-search" role="search">
            <label htmlFor="home-tool-search" className="sr-only">Search PDF tools</label>
            <Search className="pointer-events-none absolute left-5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              id="home-tool-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What do you want to do with your PDF?"
              className="h-16 w-full rounded-2xl border border-[var(--border-strong)] bg-white pl-13 pr-28 text-base text-[var(--text-primary)] shadow-[var(--shadow-md)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[#cc4435]/10"
            />
            <button type="submit" className="absolute right-2 top-2 h-12 rounded-xl border-0 bg-[var(--primary)] px-5 font-bold text-white hover:bg-[var(--primary-hover)]">
              Find tool
            </button>
            {query.trim() ? (
              <div className="absolute left-0 right-0 top-[72px] z-20 overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-2 shadow-[var(--shadow-lg)]">
                {searchMatches.length ? searchMatches.map((tool) => (
                  tool.unavailable ? (
                    <div key={tool.id} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-[var(--text-muted)]">
                      <span>{tool.title}</span><span className="text-xs font-bold uppercase">Coming soon</span>
                    </div>
                  ) : (
                    <Link key={tool.id} href={`/${tool.id}`} className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-[var(--text-primary)] no-underline hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
                      {tool.title}<ArrowRight className="h-4 w-4" />
                    </Link>
                  )
                )) : <p className="px-4 py-3 text-sm text-[var(--text-secondary)]">No matching tool yet.</p>}
              </div>
            ) : null}
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="mr-1 font-semibold text-[var(--text-secondary)]">Popular:</span>
            {popularTools.slice(0, 4).map((tool) => (
              <Link key={tool.id} href={`/${tool.id}`} className="rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 font-semibold text-[var(--text-secondary)] no-underline shadow-[var(--shadow-xs)] hover:border-[#f4c7c0] hover:text-[var(--primary)]">
                {tool.title}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Most popular" title="Finish common PDF tasks in a few clicks" description="Straightforward tools for the document jobs people do every day." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popularTools.map((tool) => (
              <ToolCard key={tool.id} id={tool.id} href={`/${tool.id}`} title={tool.title} description={tool.description} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--page)] py-20 sm:py-24" id="all-tools">
        <Container>
          <SectionHeading eyebrow="Toolbox" title="All PDF tools" description="Choose a category or search by the result you need." />
          <div className="mt-9 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter tools by category">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={`min-h-10 rounded-full border px-4 text-sm font-bold transition ${category === item ? "border-[var(--secondary)] bg-[var(--secondary)] text-white" : "border-[var(--border-strong)] bg-white text-[var(--text-secondary)] hover:border-[var(--secondary)] hover:text-[var(--secondary)]"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {TOOLS.map((tool) => (
              <ToolCard
                key={tool.id}
                id={tool.id}
                href={`/${tool.id}`}
                title={tool.title}
                description={tool.description}
                badge={tool.unavailable ? "Planned" : undefined}
                unavailable={tool.unavailable}
                compact
                hidden={!filteredTools.some((match) => match.id === tool.id)}
              />
            ))}
          </div>
          {!filteredTools.length ? (
            <p className="mt-10 text-center text-[var(--text-secondary)]">No tools match your search.</p>
          ) : null}
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <div className="overflow-hidden rounded-3xl bg-[var(--secondary)] px-6 py-10 text-white shadow-[var(--shadow-md)] sm:px-10 lg:grid lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-14 lg:px-14 lg:py-14">
            <div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><ShieldCheck className="h-6 w-6" /></span>
              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Your files stay under your control</h2>
              <p className="mt-4 max-w-xl leading-7 text-blue-100">Most PDFNova tools process files locally in your browser. When a task needs server assistance, the workspace tells you before processing begins.</p>
            </div>
            <div className="mt-9 grid gap-3 sm:grid-cols-3 lg:mt-0">
              {[
                [LockKeyhole, "Private by design", "Local processing whenever possible"],
                [WifiOff, "No installation", "Works in a modern web browser"],
                [BadgeCheck, "Clear status", "Processing method shown up front"],
              ].map(([Icon, title, text]) => {
                const FeatureIcon = Icon as typeof LockKeyhole;
                return (
                  <div key={title as string} className="rounded-2xl border border-white/10 bg-white/8 p-5">
                    <FeatureIcon className="h-5 w-5 text-red-200" />
                    <h3 className="mt-4 font-bold">{title as string}</h3>
                    <p className="mt-2 text-sm leading-6 text-blue-100">{text as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--page)] py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Simple workflow" title="How PDFNova works" description="A clean path from source file to finished document." />
          <div className="relative mt-12 grid gap-5 md:grid-cols-3">
            {[
              [UploadCloud, "1", "Choose your file", "Add documents from your device using the secure workspace."],
              [Settings2, "2", "Set your options", "Preview pages and choose only the settings relevant to your task."],
              [Download, "3", "Download the result", "Review the outcome and save one file or a ZIP of multiple outputs."],
            ].map(([Icon, number, title, text]) => {
              const StepIcon = Icon as typeof UploadCloud;
              return (
                <article key={number as string} className="relative rounded-2xl border border-[var(--border)] bg-white p-7 text-center shadow-[var(--shadow-xs)]">
                  <span className="absolute right-5 top-5 text-5xl font-black text-slate-100">{number as string}</span>
                  <span className="mx-auto grid h-13 w-13 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]"><StepIcon className="h-6 w-6" /></span>
                  <h3 className="mt-5 text-lg font-bold">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{text as string}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="section-eyebrow">Built for real work</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Powerful enough to help. Simple enough to trust.</h2>
            <p className="mt-4 text-lg leading-8 text-[var(--text-secondary)]">No crowded dashboards or hidden processing steps—just focused document workflows with clear feedback.</p>
            <Link href="#all-tools" className="pdfnova-primary-button mt-7">Explore all tools <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [Zap, "Fast workflows", "Start working without an account or software download."],
              [FileCheck2, "Useful previews", "See pages and selected files before you create the result."],
              [Check, "Focused options", "Every control is relevant to the current task."],
              [ShieldCheck, "Honest privacy", "Know whether processing happens locally or on a server."],
            ].map(([Icon, title, text]) => {
              const BenefitIcon = Icon as typeof Zap;
              return (
                <article key={title as string} className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-xs)]">
                  <BenefitIcon className="h-6 w-6 text-[var(--secondary)]" />
                  <h3 className="mt-4 font-bold">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{text as string}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--page)] py-20 sm:py-24">
        <Container>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading align="left" eyebrow="Guides" title="Work smarter with PDFs" description="Practical advice for better files, safer sharing, and cleaner results." />
            <Link href="/blog" className="pdfnova-secondary-button shrink-0">View all guides <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {BLOG_POSTS.slice(0, 3).map((post) => (
              <article key={post.slug} className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-xs)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
                <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}>
                  <BlogArtwork visual={post.visual} className="h-44" />
                </Link>
                <div className="p-6">
                  <div className="flex gap-2 text-xs font-bold uppercase tracking-wide text-[var(--secondary)]">
                    <span>{post.category}</span><span className="text-[var(--text-muted)]">·</span>
                    <time dateTime={post.publishedAt} className="text-[var(--text-muted)]">{formatBlogDate(post.publishedAt)}</time>
                  </div>
                  <h3 className="mt-3 text-lg font-bold leading-7"><Link href={`/blog/${post.slug}`} className="text-inherit no-underline group-hover:text-[var(--primary)]">{post.title}</Link></h3>
                  <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--primary)] no-underline">Read guide <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24" aria-labelledby="about-pdfnova-tools">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="section-eyebrow">A practical PDF toolbox</p>
            <h2 id="about-pdfnova-tools" className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Free online PDF tools for everyday document tasks
            </h2>
          </div>
          <div className="space-y-4 leading-8 text-[var(--text-secondary)]">
            <p>
              PDFNova brings common document jobs into one clear workspace. You can merge PDF
              files into a chosen order, split out the pages you need, compress a PDF for an
              upload limit, rotate scans, add a watermark, edit a PDF with new text, or sign a
              document. Conversion tools cover PDF to Word, PDF to JPG, PDF to PNG, JPG to PDF,
              Word to PDF, and spreadsheet to PDF workflows.
            </p>
            <p>
              Each working tool has its own page with relevant options, step-by-step guidance,
              realistic limitations, and links to useful next steps. Most tools process files on
              your device. PDF to Word and Word to PDF use a clearly labelled server-assisted
              conversion because preserving editable document structure and office layouts needs
              a dedicated conversion service.
            </p>
            <p>
              No account is required for the public tools. Choose the task that matches your
              file, review the processing notice, and preview the result before downloading it.
              If you are unsure which workflow to use, the PDF guides explain common choices in
              plain language.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--page)] py-20 sm:py-24" aria-labelledby="home-faq">
        <Container className="max-w-4xl">
          <p className="section-eyebrow">Helpful answers</p>
          <h2 id="home-faq" className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-8 divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
            {[
              ["Are PDFNova's PDF tools free?", "Yes. The working public tools can be used without creating an account or entering payment details."],
              ["Do my files get uploaded?", "Most tools process files in your browser. PDF to Word and Word to PDF use server-assisted CloudConvert processing, and those pages show that before you begin."],
              ["Which PDF tasks can I complete?", "You can merge, split, compress, rotate, watermark, sign, annotate, and convert supported PDF, image, Word, and spreadsheet files."],
              ["Can I use PDFNova on a phone or tablet?", "Yes. The interface works in current mobile browsers, although large files and page-heavy jobs are usually faster on a computer with more memory."],
              ["How do I choose between JPG and PNG?", "JPG is usually smaller and suits photos. PNG preserves sharp edges and text more clearly, but its files are often larger."],
            ].map(([question, answer], index) => (
              <details key={question} className="group" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-bold text-[var(--text-primary)] marker:content-none sm:px-6">
                  {question}
                  <span aria-hidden="true" className="text-xl text-[var(--primary)] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-5 leading-7 text-[var(--text-secondary)] sm:px-6">{answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-[var(--primary-soft)] px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(204,68,53,0.12),transparent_28%),radial-gradient(circle_at_85%_50%,rgba(28,57,141,0.1),transparent_25%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to finish your PDF task?</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--text-secondary)]">Choose a tool, add your file, and get a polished result in a few focused steps.</p>
              <Link href="#all-tools" className="pdfnova-primary-button mt-7">Choose a PDF tool <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
