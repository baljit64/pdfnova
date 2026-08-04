import PDFToJpg from "../../pages/PDFToJpg";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/pdf-to-jpg");

export default function Page() {
  return <PDFToJpg />;
}
