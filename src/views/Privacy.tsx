import Link from "next/link";

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose prose-gray max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Data we process</h2>
          <p>
            PDFNova processes files in your browser for tools such as merge, split, compress, rotate, watermark, sign and image conversion. Those tool implementations do not send the selected document to PDFNova&apos;s API. PDF to Word is different: it sends the document through PDFNova&apos;s API to CloudConvert for server-assisted conversion over HTTPS. Do not use that converter when your document-handling requirements prohibit third-party processing.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Cookies and analytics</h2>
          <p>
            We may use cookies and similar technologies for essential site operation and, if enabled, analytics to improve the service. You can control cookie preferences in your browser.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Contact</h2>
          <p>
            For privacy-related questions, please <Link href="/contact" className="text-red-500 hover:underline">contact us</Link>.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link href="/" className="text-red-500 font-medium hover:underline">← Back to home</Link>
      </div>
    </div>
  );
}
