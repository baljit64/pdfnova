import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JsonLd from "../seo/JsonLd";
import {
  BRAND_ASSETS,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  GOOGLE_SITE_VERIFICATION,
  HOME_URL,
  SITE_URL,
} from "../seo/config";

export const metadata: Metadata = {
  applicationName: "PDFNova",
  title: {
    default: DEFAULT_TITLE,
    template: "%s",
  },
  description: DEFAULT_DESCRIPTION,
  authors: [{ name: "Baljit Singh" }],
  creator: "Baljit Singh",
  publisher: "PDFNova",
  category: "Utilities",
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/assets/favicon.ico" },
      { url: "/assets/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/assets/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/assets/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/assets/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/assets/favicon.ico" }],
    apple: [
      { url: "/assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: HOME_URL,
    siteName: "PDFNova",
    images: [{ url: BRAND_ASSETS.socialImage, width: 825, height: 240, alt: "PDFNova" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [BRAND_ASSETS.socialImage],
  },
  ...(GOOGLE_SITE_VERIFICATION
    ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <JsonLd />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
