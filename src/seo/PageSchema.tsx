import { ROUTE_META } from "./config";
import JsonLdScript from "./JsonLdScript";
import { webPageSchema } from "./schema";

export default function PageSchema({ path }: { path: string }) {
  const meta = ROUTE_META[path];
  return <JsonLdScript schemas={[webPageSchema(path, meta.title, meta.description)]} id="schema-page" />;
}
