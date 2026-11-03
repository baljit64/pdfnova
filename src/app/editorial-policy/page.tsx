import EditorialPolicy from "../../views/EditorialPolicy";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/editorial-policy");

export default function EditorialPolicyPage() {
  return <EditorialPolicy />;
}
