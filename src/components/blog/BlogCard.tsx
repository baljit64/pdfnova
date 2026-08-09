import Link from "next/link";
import { formatBlogDate, type BlogPost } from "../../blog/posts";
import BlogArtwork from "./BlogArtwork";

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/blog/${post.slug}`} className="block" aria-label={`Read ${post.title}`}>
        <BlogArtwork visual={post.visual} className="h-52" />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
          <span className="text-blue-700">{post.category}</span>
          <span className="text-slate-300">•</span>
          <time dateTime={post.publishedAt} className="text-slate-500">
            {formatBlogDate(post.publishedAt)}
          </time>
        </div>
        <h2 className="text-xl font-bold leading-snug text-slate-900">
          <Link
            href={`/blog/${post.slug}`}
            className="text-inherit no-underline transition-colors group-hover:text-blue-700"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 flex-1 leading-7 text-slate-600">{post.excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-5 inline-flex items-center gap-2 font-semibold text-blue-700 no-underline"
        >
          Read article <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
