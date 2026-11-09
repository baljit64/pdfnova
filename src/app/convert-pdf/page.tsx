import PageSchema from "../../seo/PageSchema";
import ConvertPDF from "../../views/ConvertPDF";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/convert-pdf");

export default function Page() {
  return <><PageSchema path="/convert-pdf" /><ConvertPDF /></>;
}
