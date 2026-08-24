import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0b2a4a] text-white py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/" className="text-white/90 hover:text-white no-underline">PDF Tools</Link>
          <Link href="/about" className="text-white/90 hover:text-white no-underline">About</Link>
          <Link href="/blog" className="text-white/90 hover:text-white no-underline">Blog</Link>
          <Link href="/help" className="text-white/90 hover:text-white no-underline">Help</Link>
          <Link href="/contact" className="text-white/90 hover:text-white no-underline">Contact</Link>
          <Link href="/privacy" className="text-white/90 hover:text-white no-underline">Privacy Policy</Link>
          <Link href="/terms" className="text-white/90 hover:text-white no-underline">Terms of Use</Link>
        </div>

        <p className="text-sm text-gray-300 text-center md:text-left">
          © {new Date().getFullYear()} PDFNova. All rights reserved. Built by Baljit Singh.
        </p>
      </div>
    </footer>
  );
}
