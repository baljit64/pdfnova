import SignPDF from "../../pages/SignPDF";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/sign-pdf");

export default function Page() {
  return <SignPDF />;
}
