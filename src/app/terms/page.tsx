import PageSchema from "../../seo/PageSchema";
import Terms from "../../views/Terms";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/terms");

export default function Page() {
  return <><PageSchema path="/terms" /><Terms /></>;
}
