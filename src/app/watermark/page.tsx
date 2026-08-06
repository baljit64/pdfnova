import CanonicalToolPage, { canonicalMetadata } from "../../components/landing/CanonicalToolPage";

export const metadata = canonicalMetadata("watermark");

export default function Page() {
  return <CanonicalToolPage slug="watermark" />;
}
