import Link from "next/link";

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Terms of Use</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: <time dateTime="2026-08-25">August 25, 2026</time>
      </p>

      <div className="prose prose-gray max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Acceptance</h2>
          <p>
            By using PDFNova you agree to these terms. If you do not agree, please do not use the service.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Use of the service</h2>
          <p>
            PDFNova&apos;s public tools are provided for personal, educational and business document
            workflows. You must have the right to process the files you select and must follow the
            laws, contracts and organisational policies that apply to you.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Prohibited use</h2>
          <p>
            You must not use PDFNova to violate another person&apos;s privacy or intellectual property,
            distribute malware, interfere with the service, bypass technical limits, automate
            abusive traffic, or process content for an unlawful purpose. Do not attempt to access
            another user&apos;s device, files or service data.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Your files and output</h2>
          <p>
            You retain responsibility for the documents you process. Keep an original copy and
            inspect every output before relying on it, submitting it or deleting the source. PDF
            conversion can change layout, fonts, image quality, form fields, links or accessibility
            information, especially when converting between PDF and editable office formats.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Third-party processing</h2>
          <p>
            Most tools run in the browser. PDF to Word uses CloudConvert for server-assisted
            conversion and is subject to that provider&apos;s availability and terms. The tool page and
            Privacy Policy identify this difference so you can decide whether it is appropriate for
            a particular document.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-900">PDFNova content and branding</h2>
          <p>
            PDFNova&apos;s name, logo, interface copy and original guides may not be misrepresented as
            your own service. These terms do not claim ownership of documents you select or the
            content contained in your output.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Availability and changes</h2>
          <p>
            Tools may be corrected, improved, limited or temporarily unavailable. Unfinished tools
            are labelled as coming soon and may not become available on a particular date. PDFNova
            may update these terms when the service changes; the revision date above will identify
            the current version.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Disclaimer</h2>
          <p>
            The tools are provided &quot;as is&quot; and without a guarantee that every document can be
            processed accurately or that the service will always be available. To the extent
            permitted by applicable law, PDFNova is not responsible for indirect or consequential
            loss resulting from use of the service. Nothing in these terms excludes rights or
            responsibilities that applicable law does not allow to be excluded.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Contact</h2>
          <p>
            For questions about these terms, please <Link href="/contact" className="text-red-500 hover:underline">contact us</Link>.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link href="/" className="text-red-500 font-medium hover:underline">← Back to home</Link>
      </div>
    </div>
  );
}
