import Privacy from "../../pages/Privacy";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/privacy");

export default function Page() {
  return <Privacy />;
}
