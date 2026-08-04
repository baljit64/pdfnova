import JpgToPDF from "../../pages/JpgToPDF";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/jpg-to-pdf");

export default function Page() {
  return <JpgToPDF />;
}
