import Link from "next/link";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">About PDFNova</h1>

      <div className="prose prose-gray max-w-none text-gray-700 space-y-4">
        <p>
          PDFNova offers free PDF tools in one place. Merge, compress, and convert PDFs with ease—all in your browser, with no installation required.
        </p>
        <p>
          We believe in keeping things simple and secure. Your files are processed locally whenever possible, so you stay in control of your data.
        </p>
        <p>
          PDFNova was built by Baljit Singh. We&apos;re constantly improving our tools—if you have feedback or feature requests, please <Link href="/contact" className="text-red-500 hover:underline">get in touch</Link>.
        </p>
      </div>

      <div className="mt-12">
        <Link href="/" className="text-red-500 font-medium hover:underline">← Back to home</Link>
      </div>
    </div>
  );
}
