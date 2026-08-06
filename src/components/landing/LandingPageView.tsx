import Link from "next/link";
import { getTool } from "../../tools/registry";
import { landingPageSchemas } from "../../seo/schema";
import JsonLdScript from "../../seo/JsonLdScript";
import ToolWorkspace from "../tool/ToolWorkspace";
import type { LandingPage } from "../../seo/landing/types";

interface Props {
  page: LandingPage;
}

/**
 * The one template behind every tool page on the site.
 *
 * This is a server component: all the copy and structured data is rendered into
 * the initial HTML, and only `ToolWorkspace` is shipped to the browser. That is
 * what keeps hundreds of landing pages from multiplying the JavaScript bundle —
 * they all share a single client chunk.
 */
export default function LandingPageView({ page }: Props) {
  const tool = getTool(page.toolId);

  return (
    <>
      <JsonLdScript schemas={landingPageSchemas(page, tool)} id={`schema-${page.slug}`} />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            {page.breadcrumbs.map((crumb, position) => {
              const isLast = position === page.breadcrumbs.length - 1;
              const href = crumb.url.replace(/^https?:\/\/[^/]+/, "") || "/";
              return (
                <li key={crumb.url} className="flex items-center gap-2">
                  {position > 0 && <span aria-hidden="true">/</span>}
                  {isLast ? (
                    <span aria-current="page" className="text-gray-700">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link href={href} className="text-red-500 hover:underline">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <header>
          <h1 className="text-3xl font-bold text-blue-900 md:text-4xl">{page.h1}</h1>
          <p className="mt-3 text-lg text-gray-700">{tool.tagline}</p>
        </header>

        {/* The tool sits immediately below the heading — the copy comes after it. */}
        <div className="mt-8">
          <ToolWorkspace tool={tool} page={page.path} variation={page.variationId} />
        </div>

        <div className="mt-10 space-y-4 text-gray-700">
          {page.intro.map((paragraph, position) => (
            <p key={position} className="leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <section className="mt-14" aria-labelledby="how-to">
          <h2 id="how-to" className="text-2xl font-bold text-blue-900">
            How to {tool.verb} a {tool.acceptLabel} file
          </h2>
          <ol className="mt-6 space-y-5">
            {page.steps.map((step, position) => (
              <li key={step.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-semibold text-white"
                >
                  {position + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-blue-900">{step.title}</h3>
                  <p className="mt-1 leading-relaxed text-gray-700">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14" aria-labelledby="benefits">
          <h2 id="benefits" className="text-2xl font-bold text-blue-900">
            Why use this {tool.name.toLowerCase()} tool
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {page.benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-blue-900">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">{benefit.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14" aria-labelledby="features">
          <h2 id="features" className="text-2xl font-bold text-blue-900">
            Features
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {page.features.map((feature) => (
              <li key={feature.title} className="flex gap-3">
                <span aria-hidden="true" className="mt-1 text-red-500">
                  ✓
                </span>
                <span>
                  <span className="font-semibold text-blue-900">{feature.title}</span>
                  <span className="block text-sm leading-relaxed text-gray-700">{feature.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="use-cases">
          <h2 id="use-cases" className="text-2xl font-bold text-blue-900">
            When people use this
          </h2>
          <div className="mt-6 space-y-5">
            {page.useCases.map((useCase) => (
              <div key={useCase.title}>
                <h3 className="font-semibold text-blue-900">{useCase.title}</h3>
                <p className="mt-1 leading-relaxed text-gray-700">{useCase.body}</p>
              </div>
            ))}
          </div>
        </section>

        {page.sections.map((section) => (
          <section key={section.heading} className="mt-14">
            <h2 className="text-2xl font-bold text-blue-900">{section.heading}</h2>
            <div className="mt-4 space-y-4">
              {section.paragraphs.map((paragraph, position) => (
                <p key={position} className="leading-relaxed text-gray-700">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-14" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-bold text-blue-900">
            Frequently asked questions
          </h2>
          <dl className="mt-6 space-y-6">
            {page.faqs.map((faq) => (
              <div key={faq.question} className="border-b border-gray-200 pb-6 last:border-0">
                <dt className="font-semibold text-blue-900">{faq.question}</dt>
                <dd className="mt-2 leading-relaxed text-gray-700">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-14" aria-labelledby="related">
          <h2 id="related" className="text-2xl font-bold text-blue-900">
            Related tools and pages
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {page.related.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-xl border border-gray-200 bg-white p-4 no-underline transition-shadow hover:shadow-md"
                >
                  <span className="font-semibold text-blue-900">{link.label}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-gray-600">
                    {link.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-gray-600">
            Browse <Link href="/" className="text-red-500 hover:underline">every PDF tool</Link>, or read the{" "}
            <Link href="/help" className="text-red-500 hover:underline">help and FAQ</Link> pages. Details of how
            files are handled are in the{" "}
            <Link href="/privacy" className="text-red-500 hover:underline">privacy policy</Link>.
          </p>
        </section>
      </div>
    </>
  );
}
