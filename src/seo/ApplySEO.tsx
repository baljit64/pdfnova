import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  SITE_URL,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  ROUTE_META,
} from "./config";

const OG_IMAGE = `${SITE_URL}/assets/hero.png`;

function setMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

/**
 * Applies SEO meta tags and Open Graph / Twitter Card based on current route.
 * Mount once in Layout so every navigation updates title and meta.
 */
export default function ApplySEO() {
  const { pathname } = useLocation();
  const path = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const meta = ROUTE_META[path] ?? {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  };

  useEffect(() => {
    const title = meta.title;
    const description = meta.description;
    const canonical = path === "" ? "/" : path;
    const url = `${SITE_URL}${canonical}`;

    document.title = title;

    setMeta("description", description);
    setLink("canonical", url);

    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", "website", true);
    setMeta("og:url", url, true);
    setMeta("og:image", OG_IMAGE, true);
    setMeta("og:site_name", "PDFNova", true);
    setMeta("og:locale", "en_US", true);

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", OG_IMAGE);
  }, [path, meta.title, meta.description]);

  return null;
}
