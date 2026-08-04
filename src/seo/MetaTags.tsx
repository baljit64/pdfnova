 "use client";

import { useEffect } from "react";
import { SITE_URL } from "./config";

interface MetaTagsProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
}

const DEFAULT_IMAGE = `${SITE_URL}/assets/hero.png`;

/** Optional per-page override. Layout already applies route-based SEO via ApplySEO. */
export default function MetaTags({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
}: MetaTagsProps) {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    if (canonical !== undefined) {
      setLink("canonical", canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical}`);
    }
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", "website", true);
    setMeta("og:image", image, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
  }, [title, description, canonical, image]);

  return null;
}

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
