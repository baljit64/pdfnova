import Image from "next/image";
import Link from "next/link";
import Container from "./ui/Container";

const FOOTER_LINKS = [
  {
    title: "PDF tools",
    links: [
      ["Merge PDF", "/merge-pdf"],
      ["Split PDF", "/split-pdf"],
      ["Compress PDF", "/compress-pdf"],
      ["Edit PDF", "/edit-pdf"],
    ],
  },
  {
    title: "Convert",
    links: [
      ["PDF to Word", "/pdf-to-word"],
      ["PDF to JPG", "/pdf-to-jpg"],
      ["Word to PDF", "/word-to-pdf"],
      ["JPG to PDF", "/jpg-to-pdf"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Blog", "/blog"],
      ["Help centre", "/help"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy policy", "/privacy"],
      ["Terms of use", "/terms"],
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="mt-auto bg-[var(--dark)] text-white">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex rounded-lg bg-white px-3 py-2" aria-label="PDFNova home">
              <Image
                src="/assets/pdf-nova-logo-horizontal.png"
                alt="PDFNova"
                width={157}
                height={50}
                className="h-9 w-auto"
              />
            </Link>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              Fast, focused PDF tools designed to help you finish document work without installing
              extra software.
            </p>
            <span className="mt-5 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
              Privacy-first processing
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_LINKS.map((group) => (
              <section key={group.title} aria-label={group.title}>
                <h2 className="text-sm font-bold text-white">{group.title}</h2>
                <ul className="mt-4 space-y-3 p-0">
                  {group.links.map(([label, href]) => (
                    <li key={href} className="list-none">
                      <Link href={href} className="text-sm text-slate-300 no-underline transition hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PDFNova. All rights reserved.</p>
          <p>Built for simple, secure document workflows.</p>
        </div>
      </Container>
    </footer>
  );
}
