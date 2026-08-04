import PDFToWord from "../../pages/PDFToWord";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/pdf-to-word");

export default function Page() {
  return <PDFToWord />;
}
