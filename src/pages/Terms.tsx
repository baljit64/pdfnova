import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Terms of Use</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

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
            Our free PDF tools are provided for personal and lawful use. You must not use them to process content you do not have the right to use, or for any illegal purpose.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Disclaimer</h2>
          <p>
            The tools are provided &quot;as is&quot;. We do not guarantee uninterrupted or error-free operation. We are not liable for any loss or damage arising from your use of the service.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Contact</h2>
          <p>
            For questions about these terms, please <Link to="/contact" className="text-red-500 hover:underline">contact us</Link>.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-red-500 font-medium hover:underline">← Back to home</Link>
      </div>
    </div>
  );
}
