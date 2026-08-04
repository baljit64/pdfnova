import Watermark from "../../pages/Watermark";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/watermark");

export default function Page() {
  return <Watermark />;
}
