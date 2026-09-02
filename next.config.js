const allTools = [
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "rotate-pdf",
  "watermark",
  "sign-pdf",
  "edit-pdf",
  "pdf-to-jpg",
  "pdf-to-image",
  "jpg-to-pdf",
  "pdf-to-word",
  "word-to-pdf",
  "excel-to-pdf",
].join("|");

const localTools = [
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "rotate-pdf",
  "watermark",
  "sign-pdf",
  "edit-pdf",
  "pdf-to-jpg",
  "pdf-to-image",
  "jpg-to-pdf",
  "excel-to-pdf",
].join("|");

const commonVariants = [
  "online",
  "free",
  "without-signup",
  "unlimited",
  "browser",
  "without-losing-quality",
  "no-watermark",
  "on-mac",
  "on-windows",
  "on-linux",
  "on-iphone",
  "on-android",
  "on-chromebook",
  "mobile",
  "desktop",
].join("|");

const legacyToolRedirects = [
  {
    source: `/:tool(${allTools})-:variant(${commonVariants})`,
    destination: "/:tool",
  },
  {
    source: `/:tool(${localTools})-:variant(fast|secure|without-upload)`,
    destination: "/:tool",
  },
  {
    source: "/compress-pdf-:variant(under-100kb|under-500kb|under-1mb|under-2mb|under-5mb|lossless)",
    destination: "/compress-pdf",
  },
  { source: "/split-pdf-extract-pages", destination: "/split-pdf" },
  { source: "/rotate-pdf-permanently", destination: "/rotate-pdf" },
  {
    source: "/:tool(pdf-to-jpg|pdf-to-image)-high-resolution",
    destination: "/:tool",
  },
  {
    source: "/:tool(merge-pdf|jpg-to-pdf)-multiple-files",
    destination: "/:tool",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      ...legacyToolRedirects.map((redirect) => ({
        ...redirect,
        has: [{ type: "host", value: "pdfnova.in" }],
        destination: `https://www.pdfnova.in${redirect.destination}`,
        permanent: true,
      })),
      {
        source: "/:path*",
        has: [{ type: "host", value: "pdfnova.in" }],
        destination: "https://www.pdfnova.in/:path*",
        permanent: true,
      },
      ...legacyToolRedirects.map((redirect) => ({ ...redirect, permanent: true })),
    ];
  },
};

export default nextConfig;
