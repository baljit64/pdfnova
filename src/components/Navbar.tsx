 "use client";

import Link from "next/link";
import { Button } from "antd";

export default function Navbar() {
  return (
    <header className="bg-[#eef5ff] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-900 no-underline hover:text-blue-800">
          <span className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-lg font-normal">+</span>
          PDFNova
        </Link>

        <nav className="hidden md:flex gap-6 text-gray-700">
          <Link href="/merge-pdf" className="no-underline text-inherit hover:text-blue-600">Merge PDF</Link>
          <Link href="/compress-pdf" className="no-underline text-inherit hover:text-blue-600">Compress PDF</Link>
          <Link href="/convert-pdf" className="no-underline text-inherit hover:text-blue-600">Convert PDF</Link>
          <Link href="/help" className="no-underline text-inherit hover:text-blue-600">Help</Link>
        </nav>

        <Link href="/login">
          <Button type="primary" danger>Login</Button>
        </Link>
      </div>
    </header>
  );
}
