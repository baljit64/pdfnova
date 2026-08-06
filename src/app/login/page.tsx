import Login from "../../views/Login";
import { buildMetadata } from "../../seo/nextMetadata";

export const metadata = buildMetadata("/login");

export default function Page() {
  return <Login />;
}
