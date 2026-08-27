import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BLOG_POSTS,
  formatBlogDate,
  getBlogPost,
  getRelatedPosts,
} from "../../../blog/posts";
import BlogArtwork from "../../../components/blog/BlogArtwork";
import BlogCard from "../../../components/blog/BlogCard";
import Container from "../../../components/ui/Container";
import JsonLdScript from "../../../seo/JsonLdScript";
import { BRAND_ASSETS, HOME_URL, SITE_URL } from "../../../seo/config";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: `${post.title} | PDFNova`,
    description: post.excerpt,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      siteName: "PDFNova",
      publishedTime: `${post.publishedAt}T00:00:00.000Z`,
      modifiedTime: `${post.updatedAt ?? post.publishedAt}T00:00:00.000Z`,
      section: post.category,
      images: [{ url: BRAND_ASSETS.socialImage, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [BRAND_ASSETS.socialImage],
    },
  };
}

export default async function BlogPostPage({ params }: RouteParams) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const related = getRelatedPosts(post);
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt ?? post.publishedAt,
      mainEntityOfPage: url,
      image: BRAND_ASSETS.socialImage,
      author: { "@type": "Organization", name: "PDFNova", url: HOME_URL },
      publisher: { "@id": `${SITE_URL}/#organization` },
      articleSection: post.category,
      wordCount: [...post.introduction, ...post.sections.flatMap((section) => section.paragraphs)]
        .join(" ")
        .split(/\s+/).length,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: HOME_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <div className="bg-white">
      <JsonLdScript schemas={schemas} id="blog-post-jsonld" />
      <main>
        <header className="border-b border-[var(--border)] bg-[var(--page)]">
          <div className="mx-auto max-w-4xl px-6 pb-14 pt-10 text-center md:pb-20 md:pt-14">
            <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[var(--text-muted)]">
              <Link href="/" className="text-inherit no-underline hover:text-[var(--primary)]">Home</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <Link href="/blog" className="text-inherit no-underline hover:text-[var(--primary)]">Blog</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span className="text-[var(--text-secondary)]">{post.category}</span>
            </nav>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
              <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-[var(--primary)]">{post.category}</span>
              <time dateTime={post.publishedAt} className="text-[var(--text-muted)]">
                {formatBlogDate(post.publishedAt)}
              </time>
              <span className="text-slate-300" aria-hidden="true">•</span>
              <span className="text-[var(--text-muted)]">{post.readingTime} min read</span>
            </div>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.035em] text-[var(--text-primary)] md:text-6xl">
              {post.title}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-[var(--text-secondary)]">{post.excerpt}</p>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
          <BlogArtwork visual={post.visual} className="h-72 rounded-3xl md:h-[440px]" />

          <article className="mx-auto mt-12 max-w-3xl md:mt-16">
            <div className="space-y-6 text-lg leading-8 text-[var(--text-secondary)]">
              {post.introduction.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {post.sections.map((section, index) => (
              <section key={section.heading} className="mt-12 scroll-mt-24">
                <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{section.heading}</h2>
                <div className="mt-5 space-y-5 text-lg leading-8 text-[var(--text-secondary)]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets && (
                    <ul className="space-y-3 rounded-2xl border border-[#f4c7c0] bg-[var(--primary-soft)] px-6 py-5">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span className="mt-1 font-bold text-[var(--primary)]" aria-hidden="true">✓</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {index === 1 && (
                  <aside className="mt-10 overflow-hidden rounded-2xl bg-[var(--secondary)] p-7 text-white md:flex md:items-center md:justify-between md:gap-8">
                    <div>
                      <p className="text-lg font-bold">Try it with PDFNova</p>
                      <p className="mt-1 leading-6 text-blue-100">{post.tool.description}</p>
                    </div>
                    <Link
                      href={post.tool.href}
                      className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-[var(--secondary)] no-underline hover:bg-[var(--primary-soft)] md:mt-0"
                    >
                      {post.tool.label} <span aria-hidden="true">→</span>
                    </Link>
                  </aside>
                )}
              </section>
            ))}

            <div className="mt-14 border-t border-[var(--border)] pt-7 text-sm leading-6 text-[var(--text-muted)]">
              <p>
                Published by PDFNova on {formatBlogDate(post.publishedAt)}. This guide provides
                general information; follow your organisation's requirements for sensitive or
                regulated documents.
              </p>
            </div>
          </article>
        </div>

        <section className="border-t border-[var(--border)] bg-[var(--page)] py-16" aria-labelledby="related-reading">
          <Container>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="section-eyebrow">Keep learning</p>
                <h2 id="related-reading" className="mt-3 text-3xl font-bold text-[var(--text-primary)]">Related reading</h2>
              </div>
              <Link href="/blog" className="hidden font-bold text-[var(--primary)] no-underline sm:block">
                View all articles →
              </Link>
            </div>
            <div className="grid gap-7 md:grid-cols-3">
              {related.map((relatedPost) => (
                <BlogCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
