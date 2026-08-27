import { ArrowRight, Check, ChevronDown, MonitorSmartphone, ShieldCheck, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { BLOG_POSTS } from "../../blog/posts";
import { landingPageSchemas } from "../../seo/schema";
import JsonLdScript from "../../seo/JsonLdScript";
import type { LandingPage } from "../../seo/landing/types";
import { getTool } from "../../tools/registry";
import ToolIcon from "../tools/ToolIcon";
import Container from "../ui/Container";
import ToolWorkspace from "../tool/ToolWorkspace";

interface Props {
  page: LandingPage;
}

/** Shared server-rendered template behind every tool and landing-page variation. */
export default function LandingPageView({ page }: Props) {
  const tool = getTool(page.toolId);
  const relatedGuides = BLOG_POSTS.filter((post) => post.tool.href === `/${tool.slug}`);

  return (
    <>
      <JsonLdScript schemas={landingPageSchemas(page, tool)} id={`schema-${page.slug}`} />

      <div className="border-b border-[var(--border)] bg-[var(--page)]">
        <Container className="py-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 p-0 text-sm text-[var(--text-muted)]">
              {page.breadcrumbs.map((crumb, position) => {
                const isLast = position === page.breadcrumbs.length - 1;
                const href = crumb.url.replace(/^https?:\/\/[^/]+/, "") || "/";
                return (
                  <li key={crumb.url} className="flex list-none items-center gap-2">
                    {position > 0 ? <span aria-hidden="true">/</span> : null}
                    {isLast ? (
                      <span aria-current="page" className="font-medium text-[var(--text-secondary)]">{crumb.name}</span>
                    ) : (
                      <Link href={href} className="font-medium text-[var(--primary)] no-underline hover:underline">{crumb.name}</Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </Container>

        <Container className="pb-16 pt-5 text-center sm:pb-20">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[#f4c7c0] bg-[var(--primary-soft)] text-[var(--primary)] shadow-[var(--shadow-xs)]">
            <ToolIcon id={tool.id} className="h-7 w-7" />
          </span>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-bold tracking-[-0.035em] text-[var(--text-primary)] sm:text-5xl lg:text-6xl">{page.h1}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">{tool.tagline}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5"><UserRoundCheck className="h-4 w-4 text-[var(--success)]" /> No signup required</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[var(--success)]" /> Secure processing</span>
            <span className="inline-flex items-center gap-1.5"><MonitorSmartphone className="h-4 w-4 text-[var(--success)]" /> Works on any device</span>
          </div>
        </Container>
      </div>

      <main className="bg-white pb-20">
        <Container className="relative -mt-8 max-w-5xl sm:-mt-10">
          <ToolWorkspace tool={tool} page={page.path} variation={page.variationId} />
        </Container>

        <Container className="max-w-5xl pt-16 sm:pt-20">
          <div className="mx-auto max-w-3xl space-y-4 text-[var(--text-secondary)]">
            {page.intro.map((paragraph, position) => (
              <p key={position} className="text-base leading-8">{paragraph}</p>
            ))}
          </div>

          <section className="mt-16" aria-labelledby="how-to">
            <div className="max-w-2xl">
              <p className="section-eyebrow">Step by step</p>
              <h2 id="how-to" className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)]">How to {tool.verb} a {tool.acceptLabel} file</h2>
            </div>
            <ol className="mt-8 grid gap-5 p-0 md:grid-cols-3">
              {page.steps.map((step, position) => (
                <li key={step.title} className="relative list-none rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-xs)]">
                  <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-sm font-bold text-white">{position + 1}</span>
                  <h3 className="mt-5 font-bold text-[var(--text-primary)]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-16" aria-labelledby="benefits">
            <h2 id="benefits" className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Why use this {tool.name.toLowerCase()} tool</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {page.benefits.map((benefit) => (
                <article key={benefit.title} className="rounded-2xl border border-[var(--border)] bg-[var(--page)] p-6">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--success-soft)] text-[var(--success)]"><Check className="h-5 w-5" /></span>
                  <h3 className="mt-4 font-bold text-[var(--text-primary)]">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{benefit.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-16 overflow-hidden rounded-3xl bg-[var(--secondary)] p-7 text-white sm:p-10" aria-labelledby="features">
            <h2 id="features" className="text-3xl font-bold">Features</h2>
            <ul className="mt-7 grid gap-5 p-0 sm:grid-cols-2">
              {page.features.map((feature) => (
                <li key={feature.title} className="flex list-none gap-3">
                  <span aria-hidden="true" className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/12 text-red-200"><Check className="h-4 w-4" /></span>
                  <span>
                    <span className="font-bold">{feature.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-blue-100">{feature.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16" aria-labelledby="use-cases">
            <h2 id="use-cases" className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">When people use this</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {page.useCases.map((useCase) => (
                <article key={useCase.title} className="rounded-2xl border border-[var(--border)] p-6">
                  <h3 className="font-bold text-[var(--text-primary)]">{useCase.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{useCase.body}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="mx-auto max-w-3xl">
            {page.sections.map((section) => (
              <section key={section.heading} className="mt-16">
                <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">{section.heading}</h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph, position) => (
                    <p key={position} className="leading-8 text-[var(--text-secondary)]">{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="faq">
            <p className="section-eyebrow">Need to know</p>
            <h2 id="faq" className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)]">Frequently asked questions</h2>
            <div className="mt-7 divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
              {page.faqs.map((faq, index) => (
                <details key={faq.question} className="group" open={index === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-bold text-[var(--text-primary)] marker:content-none sm:px-6">
                    {faq.question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-5 leading-7 text-[var(--text-secondary)] sm:px-6">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-16" aria-labelledby="related">
            <h2 id="related" className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Related tools and pages</h2>
            <ul className="mt-7 grid gap-4 p-0 sm:grid-cols-2">
              {page.related.map((link) => (
                <li key={link.href} className="list-none">
                  <Link href={link.href} className="group flex h-full items-start justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 no-underline shadow-[var(--shadow-xs)] transition hover:-translate-y-0.5 hover:border-[#f4c7c0] hover:shadow-[var(--shadow-sm)]">
                    <span>
                      <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)]">{link.label}</span>
                      <span className="mt-1 block text-sm leading-6 text-[var(--text-secondary)]">{link.description}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-sm leading-6 text-[var(--text-secondary)]">
              Browse <Link href="/" className="font-semibold text-[var(--primary)]">every PDF tool</Link>, read the <Link href="/help" className="font-semibold text-[var(--primary)]">help and FAQ</Link> pages, or learn how files are handled in the <Link href="/privacy" className="font-semibold text-[var(--primary)]">privacy policy</Link>.
            </p>
          </section>

          {relatedGuides.length > 0 ? (
            <section className="mt-16" aria-labelledby="related-guides">
              <h2 id="related-guides" className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Related PDF guides</h2>
              <ul className="mt-7 grid gap-4 p-0 sm:grid-cols-2">
                {relatedGuides.map((post) => (
                  <li key={post.slug} className="list-none">
                    <Link href={`/blog/${post.slug}`} className="group block h-full rounded-2xl border border-[var(--border)] bg-[var(--page)] p-5 no-underline transition hover:border-[var(--secondary)]/30">
                      <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--secondary)]">{post.title}</span>
                      <span className="mt-2 block text-sm leading-6 text-[var(--text-secondary)]">{post.excerpt}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </Container>
      </main>
    </>
  );
}
