import Privacy from "../../views/Privacy";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/privacy");

export default function Page() {
  return <Privacy />;
}
