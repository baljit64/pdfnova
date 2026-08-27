import { expect, test } from "@playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";

async function pdfFixture(label: string, pageCount = 1): Promise<Buffer> {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = document.addPage([300, 400]);
    page.drawText(`${label} ${pageNumber}`, { x: 30, y: 340, size: 18, font });
  }
  return Buffer.from(await document.save());
}

test("homepage exposes functional tool links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Everything you need to work with PDFs."
  );
  await expect(page.getByRole("link", { name: /Merge PDF/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /PDF to PNG/ }).first()).toBeVisible();
});

test("merge tool produces a downloadable PDF", async ({ page }) => {
  await page.goto("/merge-pdf");
  await page.locator('input[type="file"]').setInputFiles([
    { name: "first.pdf", mimeType: "application/pdf", buffer: await pdfFixture("First") },
    { name: "second.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Second") },
  ]);
  await expect(page.getByText("first.pdf")).toBeVisible();
  await page.getByRole("button", { name: "Merge PDFs" }).click();
  await expect(page.getByRole("heading", { name: /Your merged PDF is ready/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download merged.pdf/ })).toBeVisible();
});

test("split results are offered as one ZIP download", async ({ page }) => {
  await page.goto("/split-pdf");
  await page.locator('input[type="file"]').setInputFiles({
    name: "pages.pdf",
    mimeType: "application/pdf",
    buffer: await pdfFixture("Page", 2),
  });
  await expect(page.getByText("pages.pdf")).toBeVisible();
  await page.getByRole("button", { name: "Split PDF" }).click();
  await expect(page.getByRole("button", { name: "Download all 2 as ZIP" })).toBeVisible();
});

test("PDF image conversion can select pages from thumbnails", async ({ page }) => {
  await page.goto("/pdf-to-jpg");
  await page.locator('input[type="file"]').setInputFiles({
    name: "three-pages.pdf",
    mimeType: "application/pdf",
    buffer: await pdfFixture("Image", 3),
  });
  await expect(page.getByText("three-pages.pdf")).toBeVisible();
  await expect(page.getByText("All 3 pages selected")).toBeVisible();
  await page.getByRole("button", { name: "Deselect page 2" }).click();
  await expect(page.getByText("1 of 3 pages selected")).toBeVisible();
  await page.getByRole("button", { name: "Convert to JPG" }).click();
  await expect(page.getByRole("heading", { name: /Your JPG images is ready/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /three-pages-page-2.jpg/ })).toBeVisible();
});

test("unknown routes return the custom 404", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Page not found");
});
