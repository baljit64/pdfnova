/**
 * Server-rendered JSON-LD.
 *
 * Structured data is emitted in the server HTML rather than injected on the
 * client, so crawlers see it in the initial response without executing anything.
 */

interface Props {
  schemas: Record<string, unknown>[];
  /** Distinguishes multiple blocks on the same page in the DOM. */
  id?: string;
}

/** `<` is escaped so a string inside the data can never close the script tag. */
function serialise(schemas: Record<string, unknown>[]): string {
  const payload = schemas.length === 1 ? schemas[0] : schemas;
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export default function JsonLdScript({ schemas, id }: Props) {
  if (schemas.length === 0) return null;

  return (
    <script
      type="application/ld+json"
      id={id}
      // Content is generated from our own config, never from user input.
      dangerouslySetInnerHTML={{ __html: serialise(schemas) }}
    />
  );
}
