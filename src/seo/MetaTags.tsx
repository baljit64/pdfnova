import { useEffect } from "react";

interface MetaTagsProps {
  title: string;
  description: string;
  canonical?: string;
}

const SITE_URL = "https://yourdomain.com";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export default function MetaTags({
  title,
  description,
  canonical,
}: MetaTagsProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Description
    setMeta("description", description);

    // Canonical
    if (canonical) {
      setLink("canonical", `${SITE_URL}${canonical}`);
    }

    // OpenGraph
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", "website", true);
    setMeta("og:image", DEFAULT_IMAGE, true);

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", DEFAULT_IMAGE);
  }, [title, description, canonical]);

  return null;
}

/* ---------- Helpers ---------- */

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
