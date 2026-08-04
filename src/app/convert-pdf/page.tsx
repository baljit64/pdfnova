import ConvertPDF from "../../pages/ConvertPDF";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/convert-pdf");

export default function Page() {
  return <ConvertPDF />;
}
