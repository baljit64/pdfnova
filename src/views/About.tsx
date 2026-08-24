import Link from "next/link";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
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
          <h2 className="text-xl font-semibold text-blue-900">How file processing works</h2>
          <p>
            Most PDFNova tools run locally in the browser after the page code loads. Those tools
            do not send the selected document to PDFNova&apos;s API. PDF to Word is different because
            reconstructing an editable DOCX requires server software: that page sends the PDF
            through PDFNova&apos;s API to CloudConvert over HTTPS and clearly labels the transfer.
          </p>
          <p>
            The processing notice on each tool is the source of truth. Read the full{" "}
            <Link href="/privacy" className="text-red-500 hover:underline">Privacy Policy</Link>{" "}
            before using PDFNova with confidential or regulated material.
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
    </div>
  );
}
