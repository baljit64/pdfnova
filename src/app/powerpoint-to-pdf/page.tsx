import PowerPointToPDF from "../../views/PowerPointToPDF";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/powerpoint-to-pdf");

export default function Page() {
  return <PowerPointToPDF />;
}
