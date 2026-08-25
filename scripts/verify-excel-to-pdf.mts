import fs from "node:fs";
import path from "node:path";
import { File } from "node:buffer";
import { PDFDocument } from "pdf-lib";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import * as XLSX from "xlsx";
import { excelToPDF } from "../src/tools/engine/office";
import {
  calculatePageDimensions,
  createHorizontalColumnGroups,
  detectUsedRange,
  parseWorkbook,
} from "../src/tools/engine/spreadsheet-layout";

let passed = 0;
let failed = 0;
function ok(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ok   ${name}`);
  } else {
    failed++;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function pdfText(blob: Blob): Promise<{ pages: string[]; links: string[] }> {
  const pdf = await getDocument({ data: new Uint8Array(await blob.arrayBuffer()), disableWorker: true }).promise;
  const pages: string[] = [];
  const links: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
    const annotations = await page.getAnnotations();
    for (const annotation of annotations) {
      if (typeof annotation.url === "string") links.push(annotation.url);
    }
  }
  await pdf.destroy();
  return { pages, links };
}

function syntheticWorkbook(): XLSX.WorkBook {
  const headers = [
    "Record", "Account", "Name", "Email", "Platform", "Average views",
    "Engagement", "Followers", "Country", "Audience", "Profile URL", "Notes",
  ];
  const rows: (string | number)[][] = [headers];
  for (let index = 1; index <= 60; index++) {
    rows.push([
      `ROW-${String(index).padStart(3, "0")}`,
      `account_${index}`,
      `Creator ${index}`,
      `creator${index}@example.com`,
      index % 2 ? "Instagram" : "YouTube",
      index * 1234,
      `${(index / 17).toFixed(2)}%`,
      index * 54321,
      index % 3 ? "India" : "United Kingdom",
      index % 2 ? "India (72%)" : "United States (51%)",
      `https://example.com/profiles/creator-${index}`,
      `Creator ${index} has a long profile note that must wrap inside the cell without clipping or overlapping adjacent data.`,
    ]);
  }
  const data = XLSX.utils.aoa_to_sheet(rows);
  data["!cols"] = headers.map((_, index) => ({ width: index === 11 ? 42 : index < 3 ? 22 : 18 }));
  data["!merges"] = [XLSX.utils.decode_range("B3:C3")];
  data.K2.l = { Target: "https://example.com/profiles/creator-1" };
  // A styled blank well outside the data must not enlarge the printable range.
  data.Z500 = { t: "z", s: { fill: { patternType: "solid", fgColor: { rgb: "FFFF00" } } } } as XLSX.CellObject;
  data["!ref"] = "A1:Z500";

  const objective = XLSX.utils.aoa_to_sheet([["Objective"], ["Layout regression"]]);
  objective["!cols"] = [{ width: 35 }];
  return { SheetNames: ["Data", "Objective"], Sheets: { Data: data, Objective: objective } };
}

async function convertWorkbook(workbook: XLSX.WorkBook, name: string) {
  const bytes = XLSX.write(workbook, { type: "array", bookType: "xlsx", cellStyles: true });
  const file = new File([bytes], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  return excelToPDF({ file, orientation: "auto", sheets: "all" });
}

console.log("\nspreadsheet layout");
const synthetic = syntheticWorkbook();
const dataSheet = synthetic.Sheets.Data;
const used = detectUsedRange(dataSheet, XLSX.utils.decode_cell);
ok("used range ignores distant styled blanks", used?.endRow === 60 && used.endColumn === 11, JSON.stringify(used));

const models = parseWorkbook(synthetic, "all", {
  decodeCell: XLSX.utils.decode_cell,
  encodeCell: XLSX.utils.encode_cell,
});
ok("worksheets retain workbook order", models.map((model) => model.name).join(",") === "Data,Objective");
ok("hidden/unused spreadsheet space is excluded", models[0].rows.length === 61 && models[0].columns.length === 12);
const dimensions = calculatePageDimensions(models[0], "auto");
ok("wide sheets automatically use landscape A4", dimensions.orientation === "landscape");
const groups = createHorizontalColumnGroups(models[0], dimensions.printableWidth);
ok("wide sheets produce multiple horizontal bands", groups.length > 1, `got ${groups.length}`);
ok(
  "every band fits the printable width",
  groups.every((group) => group.widths.reduce((sum, width) => sum + width, 0) <= dimensions.printableWidth + 0.01)
);
ok(
  "leading identifiers repeat dynamically",
  groups.slice(1).every((group) => group.repeatedColumnIndices.includes(0))
);

console.log("\nspreadsheet PDF rendering");
const [syntheticOutput] = await convertWorkbook(synthetic, "layout-regression.xlsx");
const syntheticPdf = await PDFDocument.load(await syntheticOutput.blob.arrayBuffer());
const syntheticText = await pdfText(syntheticOutput.blob);
ok("output keeps the original filename stem", syntheticOutput.name === "layout-regression.pdf", syntheticOutput.name);
ok("PDF is generated with a reasonable page count", syntheticPdf.getPageCount() > 2 && syntheticPdf.getPageCount() < 80, String(syntheticPdf.getPageCount()));
ok("first worksheet pages are landscape", syntheticPdf.getPage(0).getWidth() > syntheticPdf.getPage(0).getHeight());
const finalSyntheticPage = syntheticPdf.getPage(syntheticPdf.getPageCount() - 1);
ok("narrow second worksheet is portrait", finalSyntheticPage.getHeight() > finalSyntheticPage.getWidth());
ok("last source row appears in the PDF", syntheticText.pages.some((page) => page.includes("ROW-060")));
ok("worksheet header repeats on vertical pages", syntheticText.pages.filter((page) => page.includes("Record")).length > groups.length);
ok("explicit hyperlinks remain clickable", syntheticText.links.includes("https://example.com/profiles/creator-1"));

// Optional real-world acceptance run:
// npm run verify:excel -- input.xlsx expected.pdf /tmp/generated.pdf
const inputPath = process.argv[2];
const referencePath = process.argv[3];
const outputPath = process.argv[4];
if (inputPath) {
  console.log("\nprovided workbook acceptance");
  const input = new File([fs.readFileSync(inputPath)], path.basename(inputPath), {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const [output] = await excelToPDF({ file: input, orientation: "auto", sheets: "all" });
  const generated = await PDFDocument.load(await output.blob.arrayBuffer());
  const generatedText = await pdfText(output.blob);
  const generatedPages = generated.getPageCount();
  ok("provided workbook converts", output.size > 0);
  ok("provided filename is preserved", output.name === `${path.parse(inputPath).name}.pdf`, output.name);
  ok("provided output is far below the 314-page regression", generatedPages < 80, String(generatedPages));
  ok("provided output includes the final data row", generatedText.pages.some((page) => page.includes("raisa6690")));
  ok("provided output includes the second worksheet", generatedText.pages.at(-1)?.includes("Objective") === true);

  if (referencePath) {
    const reference = await PDFDocument.load(fs.readFileSync(referencePath));
    const referencePages = reference.getPageCount();
    const allowedDelta = Math.max(8, Math.ceil(referencePages * 0.35));
    ok(
      "page count stays near the reference",
      Math.abs(generatedPages - referencePages) <= allowedDelta,
      `generated ${generatedPages}, reference ${referencePages}, allowed delta ${allowedDelta}`
    );
  }
  if (outputPath) {
    fs.writeFileSync(outputPath, new Uint8Array(await output.blob.arrayBuffer()));
    console.log(`  wrote ${outputPath}`);
  }
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
