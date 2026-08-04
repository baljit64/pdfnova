import RotatePDF from "../../pages/RotatePDF";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/rotate-pdf");

export default function Page() {
  return <RotatePDF />;
}
