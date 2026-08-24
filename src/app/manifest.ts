import type { MetadataRoute } from "next";
import { DEFAULT_DESCRIPTION } from "../seo/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PDFNova – Smart PDF Tools",
    short_name: "PDFNova",
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#eef5ff",
    theme_color: "#0b2a4a",
    icons: [
      {
        src: "/assets/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
