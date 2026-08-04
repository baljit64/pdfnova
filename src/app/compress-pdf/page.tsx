import CompressPDF from "../../pages/CompressPDF";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/compress-pdf");

export default function Page() {
  return <CompressPDF />;
}
