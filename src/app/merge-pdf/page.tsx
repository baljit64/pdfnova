import MergePDF from "../../pages/MergePDF";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/merge-pdf");

export default function Page() {
  return <MergePDF />;
}
