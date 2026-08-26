import Link from "next/link";

export default function Help() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Help & FAQ</h1>

      <section className="space-y-8 text-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">How do I merge PDFs?</h2>
          <p>
            Go to <Link href="/merge-pdf" className="text-red-500 hover:underline">Merge PDF</Link>, upload two or more PDF files, then click &quot;Merge & Preview&quot;. You can remove or rotate files, then download the merged PDF.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">How do I compress a PDF?</h2>
          <p>
            Go to <Link href="/compress-pdf" className="text-red-500 hover:underline">Compress PDF</Link>, select your PDF file, and click &quot;Compress PDF&quot;. The compressed file will download automatically.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">How do I convert PDF to images?</h2>
          <p>
            Go to <Link href="/pdf-to-image" className="text-red-500 hover:underline">PDF to Image</Link>, upload your PDF, and click &quot;Convert to Images&quot;. You can download each page as a PNG image.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Is my data secure?</h2>
          <p>
            Most tools process the selected file directly in your browser. PDF to Word and Word to PDF send the file through PDFNova&apos;s API to CloudConvert over HTTPS for OCR and higher-fidelity document layout. Check the notice on each tool and avoid server-assisted conversion when your document-handling rules prohibit it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Still need help?</h2>
          <p>
            <Link href="/contact" className="text-red-500 hover:underline">Contact us</Link> and we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </section>
    </div>
  );
}
