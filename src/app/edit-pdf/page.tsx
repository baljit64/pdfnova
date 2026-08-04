import EditPDF from "../../pages/EditPDF";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/edit-pdf");

export default function Page() {
  return <EditPDF />;
}
