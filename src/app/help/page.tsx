import PageSchema from "../../seo/PageSchema";
import Help from "../../views/Help";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/help");

export default function Page() {
  return <><PageSchema path="/help" /><Help /></>;
}
