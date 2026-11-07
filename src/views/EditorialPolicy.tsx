import Link from "next/link";
import Container from "../components/ui/Container";

const linkClass = "font-semibold text-[var(--primary)] underline-offset-4 hover:underline";

export default function EditorialPolicy() {
  return (
    <Container as="main" className="pdfnova-content-page py-16 sm:py-20">
      <article className="mx-auto max-w-3xl">
        <p className="section-eyebrow">How we work</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
          PDFNova editorial policy
        </h1>
        <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">
          This page explains who creates PDFNova's guides, how tool instructions are checked,
          what our articles can and cannot promise, and how readers can report an error.
        </p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">Last reviewed: 3 November 2026</p>

        <div className="mt-10 space-y-10 text-[var(--text-secondary)]">
          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Who is responsible for the content?</h2>
            <p className="mt-3 leading-8">
              PDFNova is built and maintained by Baljit Singh. He is responsible for the product's
              tool instructions and published guides. PDFNova is an independent project; it does
              not claim to be affiliated with or endorsed by Adobe, Google, Microsoft or another
              software publisher.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">How tool instructions are prepared</h2>
            <p className="mt-3 leading-8">
              Tool-specific pages are maintained alongside the application's tool definitions.
              Before describing a workflow, we check the available controls, accepted file types,
              processing model and known limitations represented by the current implementation.
              Instructions should describe what the tool does today, not a planned feature.
            </p>
            <p className="mt-3 leading-8">
              The repository also contains automated checks for canonical tool pages, page copy,
              metadata, internal links and sitemap rules. Automated checks help catch regressions;
              they do not prove that every possible input file will produce a perfect result.
              Readers should inspect important output files before relying on or sharing them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">How guides are written</h2>
            <p className="mt-3 leading-8">
              Guides focus on practical document tasks: choosing a suitable workflow, preparing a
              source file, understanding format and quality trade-offs, checking the result, and
              recognising privacy considerations. Advice is written for general informational
              use and should not replace legal, regulatory, security or organisational guidance.
            </p>
            <p className="mt-3 leading-8">
              We aim to use original explanations and examples rather than copying another
              publisher's article. Where a guide describes PDFNova behaviour, the corresponding
              tool page and in-product processing notice are the references to check.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Accuracy, limitations and updates</h2>
            <p className="mt-3 leading-8">
              File formats, browser behaviour and PDFNova&apos;s API can change.
              We update instructions when a product change makes them inaccurate or when a reader
              reports a reproducible problem. A published guide may not cover every unusual PDF,
              font, scan or office-document layout.
            </p>
            <p className="mt-3 leading-8">
              We do not guarantee that a conversion will preserve every element of a complex
              document, that a file will meet a recipient's upload rules, or that a particular
              workflow is suitable for confidential material. Tool-specific limitations and
              processing notices take precedence over general examples in a guide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Corrections and reader feedback</h2>
            <p className="mt-3 leading-8">
              If you find an outdated instruction, incorrect feature description, broken link or
              accessibility issue, contact us with the page URL and a description of the problem.
              Include the browser and steps needed to reproduce it when relevant. Do not send
              private documents, passwords or personal information unless it is essential and
              you have confirmed an appropriate way to share it.
            </p>
            <p className="mt-3 leading-8">
              We review reported issues and correct content when the report is verified. We do not
              publish a correction log for every minor wording or interface change.
            </p>
            <Link href="/contact" className={linkClass}>Contact PDFNova about a correction</Link>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Independence and transparency</h2>
            <p className="mt-3 leading-8">
              PDFNova may use advertising or analytics services. Their presence does not change
              the goal of explaining tool behaviour and limitations accurately. We do not accept
              payment to promise a particular conversion result or to present an unsupported
              product claim as fact.
            </p>
            <p className="mt-3 leading-8">
              For details about document handling, read the{" "}
              <Link href="/privacy" className={linkClass}>Privacy Policy</Link>. For practical
              troubleshooting, visit the <Link href="/help" className={linkClass}>Help Centre</Link>.
            </p>
          </section>
        </div>
      </article>
    </Container>
  );
}
