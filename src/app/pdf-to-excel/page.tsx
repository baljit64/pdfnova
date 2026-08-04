import PDFToExcel from "../../pages/PDFToExcel";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/pdf-to-excel");

export default function Page() {
  return <PDFToExcel />;
}
