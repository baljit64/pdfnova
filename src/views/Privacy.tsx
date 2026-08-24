import Link from "next/link";

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: <time dateTime="2026-08-25">August 25, 2026</time>
      </p>

      <div className="prose prose-gray max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-blue-900">Files processed on your device</h2>
          <p>
            PDFNova processes files in your browser for tools such as merge, split, compress,
            rotate, watermark, sign, edit and image conversion. Those tool implementations do not
            send the selected document to PDFNova&apos;s API. Files remain in the current tab&apos;s
            working memory and PDFNova does not create a server-side document history for these
            local tools. Reloading or closing the tab clears that working state.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Server-assisted PDF to Word</h2>
          <p>
            PDF to Word is the exception. It sends the selected PDF through a PDFNova API route to
            CloudConvert over HTTPS, receives the converted DOCX and returns it to the browser.
            The PDFNova route does not intentionally save the document to an application database
            or user account, but CloudConvert processes the file under its own service and privacy
            terms. Do not use that converter when your document-handling requirements prohibit
            third-party processing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Site usage and technical data</h2>
          <p>
            PDFNova uses Vercel for hosting and Vercel Analytics for site-usage measurement. The
            application may measure the page and tool used, file count, aggregate byte size,
            processing duration, output count and a generic success or failure category. PDFNova&apos;s
            tool event code does not intentionally include selected filenames or document contents.
            Hosting providers may also process standard request information needed to operate and
            protect the website, such as timestamps, browser information and network identifiers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-blue-900">Cookies and analytics</h2>
          <p>
            PDFNova does not currently include Google Analytics, Google Tag Manager, AdSense or
            advertising scripts in the application. The site does not intentionally set
            advertising cookies. Browser storage or cookies may still be used where technically
            necessary by enabled platform services, and you can control them through your browser.
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
          <h2 className="text-xl font-semibold text-blue-900">Retention and your choices</h2>
          <p>
            Local tools do not have a PDFNova file-retention period because they do not create a
            server copy. Server-assisted conversion and configured support services follow the
            retention rules of their respective providers. You can avoid third-party document
            processing by using only the tools labelled as on-device, and you can choose not to
            submit the contact form.
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
    </div>
  );
}
