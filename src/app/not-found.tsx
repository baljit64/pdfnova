import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="mb-2 text-3xl font-bold text-blue-900">Page not found</h1>
      <p className="text-gray-600">The page you requested does not exist.</p>
      <h2 className="mt-8 text-xl font-semibold text-blue-900">Explore PDFNova tools</h2>
      <nav aria-label="Popular PDF tools" className="mt-4 flex flex-wrap justify-center gap-4">
        <Link href="/merge-pdf" className="text-red-500 hover:underline">Merge PDF</Link>
        <Link href="/compress-pdf" className="text-red-500 hover:underline">Compress PDF</Link>
        <Link href="/split-pdf" className="text-red-500 hover:underline">Split PDF</Link>
        <Link href="/pdf-to-word" className="text-red-500 hover:underline">PDF to Word</Link>
        <Link href="/" className="text-red-500 hover:underline">All PDF tools</Link>
      </nav>
    </div>
  );
}
