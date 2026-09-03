import type { ReactNode } from "react";
import Container from "../ui/Container";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function AuthShell({
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <section className="py-14 sm:py-20">
      <Container className="max-w-lg">
        <div className="pdfnova-form-page text-center">
          <span className="section-eyebrow">PDFNova account</span>
          <h1 className="mt-4 text-4xl font-bold">{title}</h1>
          <p className="mt-3 text-base leading-7">{description}</p>
        </div>
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8">
          {children}
        </div>
      </Container>
    </section>
  );
}
