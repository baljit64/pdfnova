import Link from "next/link";
import Container from "../components/ui/Container";

export default function Privacy() {
  return (
    <Container as="main" className="pdfnova-content-page py-16 sm:py-20">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: <time dateTime="2026-09-06">September 6, 2026</time>
      </p>

      <div className="prose prose-gray max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Files processed on your device</h2>
          <p>
            PDFNova processes files in your browser for tools such as merge, split, compress,
            rotate, watermark, sign, edit and image conversion. Those tool implementations do not
            send the selected document to PDFNova&apos;s API. Files remain in the current tab&apos;s
            working memory. Reloading or closing the tab clears that working state for visitors
            who are not signed in.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Server-assisted document conversion</h2>
          <p>
            PDF to Word and Word to PDF send the selected document through a PDFNova API route to
            CloudConvert over HTTPS and return the converted result to the browser. CloudConvert
            processes the file under its own service and privacy terms.
            Do not use these converters when your document-handling requirements prohibit
            third-party processing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Site usage and technical data</h2>
          <p>
            PDFNova uses Vercel for hosting and uses Vercel Analytics and Google Analytics for
            site-usage measurement. The application may measure the page and tool used, file count,
            aggregate byte size, processing duration, output count and a generic success or failure
            category. Google Analytics may also process browser and device information, general
            interaction data and approximate location derived from network information. PDFNova&apos;s
            tool event code does not intentionally include selected filenames or document contents.
            Hosting and analytics providers may process standard request information needed to
            operate, measure and protect the website, such as timestamps, browser information and
            network identifiers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Cookies and analytics</h2>
          <p>
            PDFNova includes Google Analytics for site measurement. Google Analytics may use
            cookies or similar browser identifiers to distinguish visits and understand aggregate
            usage. PDFNova does not currently include an AdSense advertising script and does not
            intentionally use analytics events to send selected filenames or document contents.
            You can restrict or clear cookies using your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Security</h2>
          <p>
            PDFNova is delivered over HTTPS. We use reasonable technical and organisational
            measures appropriate to the service, but no internet transmission or browser storage
            method can be guaranteed perfectly secure. Keep original files and avoid sending
            documents to server-assisted tools when third-party processing is not permitted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Contact messages</h2>
          <p>
            When the contact form is configured and a message is successfully submitted, the name,
            email address and message are sent to the configured support service so PDFNova can
            respond. Do not place passwords, payment information or sensitive document contents in
            a support message. Contact data is not used for advertising by PDFNova.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Children and international users</h2>
          <p>
            PDFNova is not designed for children to submit personal information. If you use the
            service from outside the country where its hosting or service providers operate, your
            information may be processed in the locations used by those providers. Use the service
            only where this is appropriate for your documents and applicable rules.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Your choices and requests</h2>
          <p>
            You can avoid server-assisted document processing by choosing a tool labelled as local
            browser processing, and you can choose not to submit contact information. For a
            privacy question or request concerning a contact message, use the Contact page and
            include enough information for us to understand the request.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Retention and your choices</h2>
          <p>
            When signed in, PDFNova saves completed tool results to a private account archive for
            up to 30 days so you can download them again. We do not archive the original selected
            files. Saved results are private to the account that created them and are permanently
            deleted after 30 days. Visitors do not receive a PDFNova file archive. Server-assisted
            conversion and configured support services follow the retention rules of their
            respective providers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Policy changes</h2>
          <p>
            This policy may be updated when PDFNova&apos;s tools or service providers change. The
            revision date above will be changed only when the policy itself is revised.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Contact</h2>
          <p>
            For privacy-related questions, please <Link href="/contact" className="text-red-500 hover:underline">contact us</Link>.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link href="/" className="text-red-500 font-medium hover:underline">← Back to home</Link>
      </div>
    </Container>
  );
}
