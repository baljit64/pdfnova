import WordToPDF from "../../pages/WordToPDF";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/word-to-pdf");

export default function Page() {
  return <WordToPDF />;
}
