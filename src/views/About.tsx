import Link from "next/link";
import Container from "../components/ui/Container";

export default function About() {
  return (
    <Container as="main" className="pdfnova-content-page py-16 sm:py-20">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">About PDFNova</h1>

      <div className="prose prose-gray max-w-none text-gray-700 space-y-6">
        <p>
          PDFNova is a collection of focused online tools for everyday document tasks. It helps
          people merge, split, compress, rotate, watermark, sign, edit and convert PDF files
          without installing desktop software.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">What the site is for</h2>
          <p>
            The aim is straightforward: make common PDF jobs understandable and quick while
            being honest about what each tool can and cannot do. Every working tool includes its
            controls, step-by-step instructions, practical limitations, privacy information and
            links to related tools or guides.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Our mission</h2>
          <p>
            PDFNova exists to make routine document work simple, fast and accessible without
            hiding how files are handled. The product focuses on practical controls, clear output
            and privacy-conscious choices instead of unsupported claims about speed, security or
            scale.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">How file processing works</h2>
          <p>
            Most PDFNova tools run locally in the browser after the page code loads. Those tools
            do not send the selected document to PDFNova&apos;s API. PDF to Word and Word to PDF are
            different because reconstructing editable content or preserving office-document layout
            requires server software. Those pages send the selected file through PDFNova&apos;s API to
            CloudConvert over HTTPS and clearly label the transfer.
          </p>
          <p>
            The processing notice on each tool is the source of truth. Read the full{" "}
            <Link href="/privacy" className="text-red-500 hover:underline">Privacy Policy</Link>{" "}
            before using PDFNova with confidential or regulated material.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Security and privacy</h2>
          <p>
            PDFNova is served over HTTPS. Browser-based tools keep selected files in the current
            browser session, while the server-assisted PDF to Word and Word to PDF tools transfer
            the selected document to their conversion provider over HTTPS. Choose the processing
            model that fits your document-handling requirements, especially for confidential or
            regulated material.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Devices and browsers</h2>
          <p>
            PDFNova is designed for current versions of Chrome, Edge, Firefox and Safari on
            desktop, tablet and mobile devices. Large or complex documents need more memory and
            may work better on a desktop computer. No account is required for the working public
            tools.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Who builds PDFNova</h2>
          <p>
            PDFNova was built by Baljit Singh and is improved based on real document workflows,
            browser capabilities and user feedback. The site does not claim a fabricated company
            history, office or user count. For feedback or feature requests, please{" "}
            <Link href="/contact" className="text-red-500 hover:underline">contact PDFNova</Link>.
          </p>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap gap-5">
        <Link href="/" className="text-red-500 font-medium hover:underline">Explore PDF tools</Link>
        <Link href="/blog" className="text-red-500 font-medium hover:underline">Read PDF guides</Link>
      </div>
    </Container>
  );
}
