import Contact from "../../views/Contact";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/contact");

export default function Page() {
  return <Contact />;
}
