/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "pdfnova.in" }],
        destination: "https://www.pdfnova.in/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
