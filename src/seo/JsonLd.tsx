import JsonLdScript from "./JsonLdScript";
import { organizationSchema, websiteSchema } from "./schema";

/**
 * Site-wide structured data, rendered once in the layout.
 *
 * Only the WebSite and Organization entities live here. Page-level markup —
 * Breadcrumb, FAQ, SoftwareApplication and HowTo — is emitted by each landing
 * page from its own content, so nothing is declared twice.
 */
export default function JsonLd() {
  return <JsonLdScript schemas={[websiteSchema(), organizationSchema()]} id="schema-site" />;
}
