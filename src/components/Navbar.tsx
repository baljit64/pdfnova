 "use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "antd";

export default function Navbar() {
  return (
    <header className="bg-[#eef5ff] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center no-underline" aria-label="PDFNova home">
          <Image
            src="/assets/pdf-nova-logo-horizontal.png"
            alt="PDFNova"
            width={157}
            height={50}
            priority
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <nav className="hidden md:flex gap-6 text-gray-700">
          <Link href="/merge-pdf" className="no-underline text-inherit hover:text-blue-600">Merge PDF</Link>
          <Link href="/compress-pdf" className="no-underline text-inherit hover:text-blue-600">Compress PDF</Link>
          <Link href="/convert-pdf" className="no-underline text-inherit hover:text-blue-600">Convert PDF</Link>
          <Link href="/blog" className="no-underline text-inherit hover:text-blue-600">Blog</Link>
          <Link href="/help" className="no-underline text-inherit hover:text-blue-600">Help</Link>
        </nav>

        <Link href="/login">
          <Button type="primary" danger>Login</Button>
        </Link>
      </div>
    </header>
  );
}
