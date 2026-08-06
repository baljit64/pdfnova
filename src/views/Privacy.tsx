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
            PDFNova is designed to process your PDF files in your browser when possible. We do not store or upload your documents to our servers for the core tools (merge, compress, PDF to image). If you use features that require a server (e.g. future cloud features), we will only process data as described at the time of use.
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
