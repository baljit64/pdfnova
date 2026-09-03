import Signup from "../../views/Signup";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/signup");

export default function Page() {
  return <Signup />;
}
