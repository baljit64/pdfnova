import About from "../../views/About";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/about");

export default function Page() {
  return <About />;
}
