import PDFToPowerPoint from "../../pages/PDFToPowerPoint";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/pdf-to-powerpoint");

export default function Page() {
  return <PDFToPowerPoint />;
}
