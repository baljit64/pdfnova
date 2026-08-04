import Terms from "../../pages/Terms";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/terms");

export default function Page() {
  return <Terms />;
}
