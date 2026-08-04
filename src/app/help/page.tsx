import Help from "../../pages/Help";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/help");

export default function Page() {
  return <Help />;
}
