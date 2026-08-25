import { getAllLandingPages, getVariationLandingPages } from "../src/seo/landing/generate";
import { AVAILABLE_TOOL_IDS, TOOLS } from "../src/tools/registry";
import { VARIATIONS } from "../src/seo/landing/variations";

const pages = getAllLandingPages();
let pass = 0, fail = 0;
const ok = (n: string, c: boolean, e = "") => { c ? (pass++, console.log(`  ok   ${n}`)) : (fail++, console.log(`  FAIL ${n} ${e}`)); };

console.log(`\ncatalogue: ${pages.length} pages (${getVariationLandingPages().length} variations + ${pages.length - getVariationLandingPages().length} canonical)`);
console.log(`tools: ${AVAILABLE_TOOL_IDS.length} available, variations defined: ${VARIATIONS.length}`);

const slugs = pages.map(p => p.slug);
ok("no duplicate slugs", new Set(slugs).size === slugs.length,
   `dupes: ${slugs.filter((s,i)=>slugs.indexOf(s)!==i).slice(0,5)}`);
ok("no duplicate titles", new Set(pages.map(p=>p.title)).size === pages.length,
   `${pages.length - new Set(pages.map(p=>p.title)).size} dupes`);
ok("no duplicate descriptions", new Set(pages.map(p=>p.description)).size === pages.length);
ok("no duplicate H1s", new Set(pages.map(p=>p.h1)).size === pages.length);

const short = pages.filter(p => p.wordCount < 1000);
ok("every page over 1000 words", short.length === 0, short.slice(0,3).map(p=>`${p.slug}:${p.wordCount}`).join(", "));
const counts = pages.map(p => p.wordCount);
console.log(`  word counts: min ${Math.min(...counts)}, max ${Math.max(...counts)}, avg ${Math.round(counts.reduce((a,b)=>a+b,0)/counts.length)}`);

const longTitles = pages.filter(p => p.title.length > 70);
ok("titles within 70 chars", longTitles.length === 0, longTitles.slice(0,3).map(p=>`${p.title.length}:${p.title}`).join(" | "));
const longDescs = pages.filter(p => p.description.length > 160);
ok("descriptions within 160 chars", longDescs.length === 0, longDescs.slice(0,2).map(p=>`${p.description.length}`).join(", "));

ok("every page has >=5 FAQs", pages.every(p => p.faqs.length >= 5));
ok("every page has steps", pages.every(p => p.steps.length >= 4));
ok("every page has related links", pages.every(p => p.related.length >= 5));
ok("every page has breadcrumbs", pages.every(p => p.breadcrumbs.length >= 2));

// No page may claim on-device processing for the server-side tool.
const serverPages = pages.filter(p => TOOLS[p.toolId].processingType !== "client");
ok("server-side tool has no local-only variations",
   serverPages.every(p => !["secure","without-upload","fast"].includes(p.variationId)),
   serverPages.map(p=>p.variationId).filter(v=>["secure","without-upload","fast"].includes(v)).join(","));

// Internal linking: every page must be reachable from another page's links.
const linked = new Set(pages.flatMap(p => p.related.map(r => r.href.slice(1))));
const orphans = pages.filter(p => !linked.has(p.slug));
ok("no orphan pages", orphans.length === 0, `${orphans.length} orphans: ${orphans.slice(0,5).map(p=>p.slug).join(", ")}`);

const inbound = new Map<string, number>();
pages.forEach(p => p.related.forEach(r => inbound.set(r.href.slice(1), (inbound.get(r.href.slice(1)) ?? 0) + 1)));
console.log(`  inbound links: min ${Math.min(...pages.map(p=>inbound.get(p.slug)??0))}, max ${Math.max(...[...inbound.values()])}`);

ok("all related links point at real pages",
   pages.every(p => p.related.every(r => slugs.includes(r.href.slice(1)))),
   pages.flatMap(p=>p.related).map(r=>r.href.slice(1)).filter(h=>!slugs.includes(h)).slice(0,3).join(", "));

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
