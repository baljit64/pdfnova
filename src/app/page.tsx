import PageSchema from "../seo/PageSchema";
import Home from "../views/Home/index";
import { buildMetadata } from "../seo/nextMetadata";

export const metadata = buildMetadata("/");

export default function Page() {
  return <><PageSchema path="/" /><Home /></>;
}
