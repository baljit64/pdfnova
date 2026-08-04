import SplitPDF from "../../pages/SplitPDF";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/split-pdf");

export default function Page() {
  return <SplitPDF />;
}
