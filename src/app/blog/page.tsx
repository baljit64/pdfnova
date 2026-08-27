import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS, formatBlogDate } from "../../blog/posts";
import BlogArtwork from "../../components/blog/BlogArtwork";
import BlogCard from "../../components/blog/BlogCard";
import Container from "../../components/ui/Container";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata: Metadata = buildMetadata("/blog");

export default function BlogPage() {
  const featured = BLOG_POSTS.find((post) => post.featured) ?? BLOG_POSTS[0];
  const remaining = BLOG_POSTS.filter((post) => post.slug !== featured.slug);

  return (
    <div className="bg-[var(--page)]">
      <section className="border-b border-[var(--border)] bg-[radial-gradient(circle_at_20%_20%,rgba(204,68,53,0.1),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(28,57,141,0.1),transparent_30%)]">
        <Container className="py-16 text-center md:py-24">
          <p className="section-eyebrow">
            PDFNova resources
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-[-0.035em] text-[var(--text-primary)] md:text-6xl">
            Practical guides for better PDF work
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
            Straightforward tutorials, document tips, and privacy guidance to help you get the
            right result the first time.
          </p>
        </Container>
      </section>

      <Container as="main" className="py-14 md:py-20">
        <article className="grid overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-md)] md:grid-cols-2">
          <BlogArtwork visual={featured.visual} className="min-h-72 md:min-h-[430px]" />
          <div className="flex flex-col justify-center p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]">
              <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-[var(--primary)]">Featured guide</span>
              <span className="text-[var(--text-muted)]">•</span>
              <time dateTime={featured.publishedAt} className="text-[var(--text-muted)]">
                {formatBlogDate(featured.publishedAt)}
              </time>
            </div>
            <h2 className="mt-5 text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl">
              <Link href={`/blog/${featured.slug}`} className="text-inherit no-underline hover:text-[var(--primary)]">
                {featured.title}
              </Link>
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">{featured.excerpt}</p>
            <div className="mt-7 flex items-center gap-4">
              <Link
                href={`/blog/${featured.slug}`}
                className="pdfnova-primary-button"
              >
                Read the guide <span aria-hidden="true">→</span>
              </Link>
              <span className="text-sm text-[var(--text-muted)]">{featured.readingTime} min read</span>
            </div>
          </div>
        </article>

        <section className="mt-20" aria-labelledby="latest-guides">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="section-eyebrow">Learn and do</p>
              <h2 id="latest-guides" className="mt-3 text-3xl font-bold text-[var(--text-primary)]">
                Latest guides
              </h2>
            </div>
            <p className="text-sm text-[var(--text-muted)]">{BLOG_POSTS.length} original articles</p>
          </div>
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {remaining.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <section className="mt-20 overflow-hidden rounded-3xl bg-[var(--secondary)] px-8 py-12 text-white md:flex md:items-center md:justify-between md:px-12">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-200">Ready to start?</p>
            <h2 className="mt-3 text-3xl font-bold">Put the guides into practice</h2>
            <p className="mt-3 leading-7 text-blue-100">
              Merge, split, compress, convert, and organise your PDFs with free browser tools.
            </p>
          </div>
          <Link
            href="/"
            className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 font-bold text-[var(--secondary)] no-underline transition hover:bg-[var(--primary-soft)] md:mt-0"
          >
            Explore all PDF tools
          </Link>
        </section>
      </Container>
    </div>
  );
}
