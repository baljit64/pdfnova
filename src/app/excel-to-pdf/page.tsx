import ExcelToPDF from "../../pages/ExcelToPDF";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/excel-to-pdf");

export default function Page() {
  return <ExcelToPDF />;
}
