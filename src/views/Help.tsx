import Link from "next/link";
import Container from "../components/ui/Container";

const linkClass = "font-semibold text-[var(--primary)] underline-offset-4 hover:underline";

export default function Help() {
  return (
    <Container as="main" className="pdfnova-content-page py-16 sm:py-20">
      <header className="mx-auto max-w-3xl">
        <p className="section-eyebrow">PDFNova support</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">Help centre</h1>
        <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">
          Practical instructions for choosing a PDF workflow, preparing files, checking the
          result and resolving common problems. Each tool page also explains its own options,
          accepted files and limitations.
        </p>
      </header>

      <div className="mx-auto mt-12 max-w-3xl space-y-12">
        <section aria-labelledby="choose-tool">
          <h2 id="choose-tool" className="text-2xl font-bold text-[var(--text-primary)]">Choose the right tool</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["/merge-pdf", "Merge PDF", "Combine several PDFs into one file and arrange their reading order."],
              ["/split-pdf", "Split PDF", "Create one file per page or extract selected pages and ranges."],
              ["/compress-pdf", "Compress PDF", "Reduce file size when an email or upload form has a limit."],
              ["/rotate-pdf", "Rotate PDF", "Correct pages that are sideways or upside down."],
              ["/pdf-to-word", "PDF to Word", "Create an editable DOCX copy; complex layouts may need adjustment."],
              ["/word-to-pdf", "Word to PDF", "Create a PDF version of a supported Word document."],
              ["/pdf-to-jpg", "PDF to JPG", "Export PDF pages as JPG images."],
              ["/jpg-to-pdf", "JPG to PDF", "Place image files into a single PDF document."],
            ].map(([href, title, description]) => (
              <article key={href} className="rounded-2xl border border-[var(--border)] bg-white p-5">
                <h3 className="font-bold"><Link href={href} className={linkClass}>{title}</Link></h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 leading-7 text-[var(--text-secondary)]">
            Browse the <Link href="/#all-tools" className={linkClass}>complete tool list</Link> for
            other available workflows. The individual tool page is the best place to confirm
            current file limits, settings and supported formats before selecting a document.
          </p>
        </section>

        <section aria-labelledby="prepare-files">
          <h2 id="prepare-files" className="text-2xl font-bold text-[var(--text-primary)]">Prepare a file before processing</h2>
          <ul className="mt-5 list-disc space-y-3 pl-6 leading-7 text-[var(--text-secondary)]">
            <li>Use a file format accepted by the selected tool. Changing a filename extension does not convert the file's actual format.</li>
            <li>Check the tool page for its current file-size and file-count limits before uploading.</li>
            <li>If a PDF is password-protected, open it with the password in a PDF reader and export an allowed, unlocked copy. PDFNova does not bypass document passwords.</li>
            <li>For scanned documents, remember that a scan is usually an image of text. Select an OCR option when the converter offers one, and proofread the recognised text.</li>
            <li>Keep an unchanged copy of important source documents until you have checked the downloaded result.</li>
          </ul>
        </section>

        <section aria-labelledby="common-issues">
          <h2 id="common-issues" className="text-2xl font-bold text-[var(--text-primary)]">Troubleshoot common problems</h2>
          <div className="mt-5 space-y-6">
            <article>
              <h3 className="font-bold text-[var(--text-primary)]">The file is rejected or will not open</h3>
              <p className="mt-2 leading-7 text-[var(--text-secondary)]">
                Confirm that the file is complete, opens in a trusted PDF or office application,
                and matches the format shown on the tool page. Re-export a damaged or incomplete
                file from its original application. Do not simply rename it to a different extension.
              </p>
            </article>
            <article>
              <h3 className="font-bold text-[var(--text-primary)]">The result looks different from the original</h3>
              <p className="mt-2 leading-7 text-[var(--text-secondary)]">
                Conversion can change fonts, spacing, tables or page breaks, especially when a
                PDF contains scans, unusual fonts or complex columns. Try the appropriate
                conversion settings, compare the output page by page, and correct any changes in
                the destination editor. Keep the source file for comparison.
              </p>
            </article>
            <article>
              <h3 className="font-bold text-[var(--text-primary)]">The output is still too large</h3>
              <p className="mt-2 leading-7 text-[var(--text-secondary)]">
                Image-heavy scans and photographs often account for most of a PDF's size. Try a
                stronger compression setting only if the resulting text and images remain
                readable. If the destination permits it, remove pages that are not needed or
                split the document into accepted sections.
              </p>
            </article>
            <article>
              <h3 className="font-bold text-[var(--text-primary)]">The download does not start</h3>
              <p className="mt-2 leading-7 text-[var(--text-secondary)]">
                Check your browser's download indicator and download permissions, then try again.
                If the browser blocks multiple downloads, allow the download for this site.
                Confirm that the device has enough free storage.
              </p>
            </article>
            <article>
              <h3 className="font-bold text-[var(--text-primary)]">A tool is slow or stops during processing</h3>
              <p className="mt-2 leading-7 text-[var(--text-secondary)]">
                Large documents and high-resolution scans need more memory and processing time.
                Close other heavy tabs, use an up-to-date browser, and try a smaller batch if the
                tool supports multiple files. Avoid refreshing until you have saved any result
                already produced.
              </p>
            </article>
          </div>
        </section>

        <section aria-labelledby="privacy-processing">
          <h2 id="privacy-processing" className="text-2xl font-bold text-[var(--text-primary)]">Where are my files processed?</h2>
          <p className="mt-4 leading-7 text-[var(--text-secondary)]">
            Processing depends on the tool. Most PDFNova operations run locally in the browser.
            PDF to Word and Word to PDF send the selected file to PDFNova&apos;s API over HTTPS for
            conversion. The file leaves your device and the converted result is returned to your
            browser.
            Read the processing notice shown on the specific tool and the{" "}
            <Link href="/privacy" className={linkClass}>Privacy Policy</Link> before choosing a
            workflow for confidential or regulated documents.
          </p>
          <p className="mt-3 leading-7 text-[var(--text-secondary)]">
            Do not upload a document if your employer, client, school or applicable rules prohibit
            processing it on a remote server. Use an approved workflow instead.
          </p>
        </section>

        <section aria-labelledby="contact-support" className="rounded-2xl border border-[var(--border)] bg-[var(--page)] p-6 sm:p-8">
          <h2 id="contact-support" className="text-2xl font-bold text-[var(--text-primary)]">Still need help?</h2>
          <p className="mt-3 leading-7 text-[var(--text-secondary)]">
            Send us the tool name, the steps you took, your browser and device, and the exact
            error message. Please do not attach confidential documents or passwords. This
            information helps us reproduce the problem without asking you to share private files.
          </p>
          <Link href="/contact" className="pdfnova-primary-button mt-5">Contact PDFNova</Link>
        </section>

        <p className="text-sm leading-6 text-[var(--text-muted)]">
          For information about how guides are prepared and how corrections are handled, read our{" "}
          <Link href="/editorial-policy" className={linkClass}>Editorial Policy</Link>.
        </p>
      </div>
    </Container>
  );
}
