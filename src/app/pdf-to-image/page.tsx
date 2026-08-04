import PDFToImage from "../../pages/PDFToImage";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/pdf-to-image");

export default function Page() {
  return <PDFToImage />;
}
