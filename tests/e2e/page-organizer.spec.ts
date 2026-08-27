import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { PDFDocument, StandardFonts } from "pdf-lib";

async function pdfFixture(label: string, widths: number[]): Promise<Buffer> {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  for (let index = 0; index < widths.length; index += 1) {
    const page = document.addPage([widths[index], 400]);
    page.drawText(`${label} ${index + 1}`, { x: 30, y: 340, size: 18, font });
  }
  return Buffer.from(await document.save());
}

async function downloadedPdf(page: import("@playwright/test").Page, buttonName: RegExp) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: buttonName }).click(),
  ]);
  const path = await download.path();
  if (!path) throw new Error("Playwright did not expose the downloaded file.");
  return PDFDocument.load(await readFile(path));
}

test("merge organizer reorders, rotates, removes, and exports pages", async ({ page }) => {
  await page.goto("/merge-pdf");
  await page.locator('input[type="file"]').setInputFiles([
    { name: "first.pdf", mimeType: "application/pdf", buffer: await pdfFixture("First", [301, 302]) },
    { name: "second.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Second", [401, 402]) },
  ]);
  await expect(page.getByRole("heading", { name: "Arrange 4 pages" })).toBeVisible();
  await expect(
    page.getByText("Drag pages or use the arrow buttons to set the final PDF order.", { exact: true })
  ).toBeVisible();
  await page.getByRole("button", { name: "Remove first.pdf page 2" }).click();
  await page.getByRole("button", { name: "Move second.pdf page 1 left" }).click();
  await page.getByRole("button", { name: "Rotate second.pdf page 1 clockwise" }).click();
  await page.getByRole("button", { name: "Merge PDFs" }).click();
  await expect(page.getByRole("heading", { name: "Your merged PDF is ready" })).toBeVisible();
  const output = await downloadedPdf(page, /Download merged\.pdf/);
  expect(output.getPages().map((item) => item.getWidth())).toEqual([401, 301, 402]);
  expect(output.getPage(0).getRotation().angle).toBe(90);
});

test("split organizer exports selected pages separately", async ({ page }) => {
  await page.goto("/split-pdf");
  await page.locator('input[type="file"]').setInputFiles({
    name: "pages.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Page", [301, 302, 303]),
  });
  await expect(page.getByRole("heading", { name: "Choose and arrange 3 pages" })).toBeVisible();
  await expect(page.getByText("3 of 3 pages selected.", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("listitem", {
      name: "pages.pdf page 2, selected, output position 2, rotation 0 degrees",
    })
  ).toBeVisible();
  await page.getByRole("button", { name: "Deselect pages.pdf page 2" }).click();
  await expect(page.getByText("2 of 3 pages selected.", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("listitem", {
      name: "pages.pdf page 2, not selected, output position — not selected, rotation 0 degrees",
    })
  ).toBeVisible();
  await page.getByRole("button", { name: "Move pages.pdf page 3 left" }).click();
  await page.getByRole("button", { name: "Move pages.pdf page 3 left" }).click();
  await page.getByRole("button", { name: "Split PDF" }).click();
  await expect(page.getByRole("button", { name: "Download all 2 as ZIP" })).toBeVisible();
  const pageThree = await downloadedPdf(page, /Download pages-page-3\.pdf/);
  const pageOne = await downloadedPdf(page, /Download pages-page-1\.pdf/);
  expect(pageThree.getPages()).toHaveLength(1);
  expect(pageThree.getPage(0).getWidth()).toBe(303);
  expect(pageOne.getPages()).toHaveLength(1);
  expect(pageOne.getPage(0).getWidth()).toBe(301);
});

test("split organizer exports one combined PDF in visual order", async ({ page }) => {
  await page.goto("/split-pdf");
  await page.locator('input[type="file"]').setInputFiles({
    name: "pages.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Page", [301, 302, 303]),
  });
  await expect(page.getByRole("heading", { name: "Choose and arrange 3 pages" })).toBeVisible();
  await page.getByRole("button", { name: "Deselect pages.pdf page 2" }).click();
  await page.getByRole("button", { name: "Move pages.pdf page 3 left" }).click();
  await page.getByRole("button", { name: "Move pages.pdf page 3 left" }).click();
  await page.getByLabel("One combined PDF").check();
  await page.getByRole("button", { name: "Split PDF" }).click();
  const output = await downloadedPdf(page, /Download pages-pages\.pdf/);
  expect(output.getPages().map((item) => item.getWidth())).toEqual([303, 301]);
});

test("keyboard drag announces page names and output positions without internal IDs", async ({ page }) => {
  await page.goto("/merge-pdf");
  await page.locator('input[type="file"]').setInputFiles([
    { name: "first.pdf", mimeType: "application/pdf", buffer: await pdfFixture("First", [301]) },
    { name: "second.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Second", [401]) },
  ]);
  await expect(page.getByRole("heading", { name: "Arrange 2 pages" })).toBeVisible();

  const handle = page.getByRole("button", { name: "Drag second.pdf page 1", exact: true });
  const announcement = page.locator('[role="status"][aria-live="assertive"]');
  await handle.focus();
  await handle.press("Space");
  await expect(announcement).toContainText(/second\.pdf page 1.*output position 2/i);
  await expect(announcement).not.toContainText(/file-\d+:\d+/i);
  await handle.press("ArrowLeft");
  await expect(announcement).toContainText(/second\.pdf page 1.*output position 1/i);
  await handle.press("Space");
  await expect(announcement).toContainText(/second\.pdf page 1.*output position 1/i);
  await expect(announcement).not.toContainText(/file-\d+:\d+/i);
});

test("mobile move buttons announce the moved page and output position", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "This covers the Pixel 7 touch viewport.");
  await page.goto("/merge-pdf");
  await page.locator('input[type="file"]').setInputFiles([
    { name: "first.pdf", mimeType: "application/pdf", buffer: await pdfFixture("First", [301]) },
    { name: "second.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Second", [401]) },
  ]);
  await expect(page.getByRole("heading", { name: "Arrange 2 pages" })).toBeVisible();

  const moveLeft = page.getByRole("button", { name: "Move second.pdf page 1 left" });
  await expect(moveLeft).toBeVisible();
  await moveLeft.click();
  await expect(page.locator('p[aria-live="polite"][aria-atomic="true"]')).toContainText(
    "Moved second.pdf page 1. Output position 1."
  );
});

test("merge organizer preserves page edits when another source is appended", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "This state-heavy regression runs once at the desktop viewport.");
  await page.goto("/merge-pdf");
  const input = page.locator('input[type="file"]');
  await input.setInputFiles([
    { name: "first.pdf", mimeType: "application/pdf", buffer: await pdfFixture("First", [301, 302]) },
    { name: "second.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Second", [401]) },
  ]);
  await expect(page.getByRole("heading", { name: "Arrange 3 pages" })).toBeVisible();
  await page.getByRole("button", { name: "Remove first.pdf page 2" }).click();
  await expect(page.getByRole("heading", { name: "Arrange 2 pages" })).toBeVisible();
  await page.getByRole("button", { name: "Rotate second.pdf page 1 clockwise" }).click();
  await expect(
    page.getByRole("listitem", {
      name: "second.pdf page 1, selected, output position 2, rotation 90 degrees",
    })
  ).toBeVisible();

  await input.setInputFiles({
    name: "third.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Third", [501]),
  });
  await expect(page.getByRole("heading", { name: "Arrange 3 pages" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove first.pdf page 2" })).toHaveCount(0);
  await expect(
    page.getByRole("listitem", {
      name: "second.pdf page 1, selected, output position 2, rotation 90 degrees",
    })
  ).toBeVisible();
  await expect(
    page.getByRole("listitem", {
      name: "third.pdf page 1, selected, output position 3, rotation 0 degrees",
    })
  ).toBeVisible();

  await page.getByRole("button", { name: "Merge PDFs" }).click();
  const output = await downloadedPdf(page, /Download merged\.pdf/);
  expect(output.getPages().map((item) => item.getWidth())).toEqual([301, 401, 501]);
  expect(output.getPages().map((item) => item.getRotation().angle)).toEqual([0, 90, 0]);
});

test("invalid split ranges retain the last valid visual page selection", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "This state-heavy regression runs once at the desktop viewport.");
  await page.goto("/split-pdf");
  await page.locator('input[type="file"]').setInputFiles({
    name: "pages.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Page", [301, 302, 303]),
  });
  await expect(page.getByRole("heading", { name: "Choose and arrange 3 pages" })).toBeVisible();

  const ranges = page.getByLabel("Pages to extract");
  await ranges.fill("3, 1");
  await expect(page.getByText("2 of 3 pages selected.", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("listitem", {
      name: "pages.pdf page 3, selected, output position 1, rotation 0 degrees",
    })
  ).toBeVisible();
  await expect(
    page.getByRole("listitem", {
      name: "pages.pdf page 1, selected, output position 2, rotation 0 degrees",
    })
  ).toBeVisible();

  await ranges.fill("99");
  await expect(page.getByText(/Page 99 does not exist/)).toBeVisible();
  await expect(page.getByText("2 of 3 pages selected.", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("listitem", {
      name: "pages.pdf page 3, selected, output position 1, rotation 0 degrees",
    })
  ).toBeVisible();
  await expect(
    page.getByRole("listitem", {
      name: "pages.pdf page 1, selected, output position 2, rotation 0 degrees",
    })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Split PDF" })).toBeDisabled();

  await ranges.fill("3, 1");
  await expect(page.getByText(/Page 99 does not exist/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Split PDF" })).toBeEnabled();
  await page.getByLabel("One combined PDF").check();
  await page.getByRole("button", { name: "Split PDF" }).click();
  const output = await downloadedPdf(page, /Download pages-pages\.pdf/);
  expect(output.getPages().map((item) => item.getWidth())).toEqual([303, 301]);
});

test("merge organizer preserves edited order after a source file is removed", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "This state-heavy regression runs once at the desktop viewport.");
  await page.goto("/merge-pdf");
  await page.locator('input[type="file"]').setInputFiles([
    { name: "first.pdf", mimeType: "application/pdf", buffer: await pdfFixture("First", [301]) },
    { name: "second.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Second", [401]) },
    { name: "third.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Third", [501]) },
  ]);
  await expect(page.getByRole("heading", { name: "Arrange 3 pages" })).toBeVisible();
  await page.getByRole("button", { name: "Move third.pdf page 1 left" }).click();
  await page.getByRole("button", { name: "Move third.pdf page 1 left" }).click();
  await page.getByRole("button", { name: "Rotate second.pdf page 1 clockwise" }).click();
  await page.getByRole("button", { name: "Remove first.pdf", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Arrange 2 pages" })).toBeVisible();
  await expect(
    page.getByRole("listitem", {
      name: "third.pdf page 1, selected, output position 1, rotation 0 degrees",
    })
  ).toBeVisible();
  await expect(
    page.getByRole("listitem", {
      name: "second.pdf page 1, selected, output position 2, rotation 90 degrees",
    })
  ).toBeVisible();

  await page.getByRole("button", { name: "Merge PDFs" }).click();
  const output = await downloadedPdf(page, /Download merged\.pdf/);
  expect(output.getPages().map((item) => item.getWidth())).toEqual([501, 401]);
  expect(output.getPages().map((item) => item.getRotation().angle)).toEqual([0, 90]);
});

test("visual organizer rejects 101 pages before showing a partial grid", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "The page cap is viewport independent.");
  await page.goto("/split-pdf");
  await page.locator('input[type="file"]').setInputFiles({
    name: "too-many.pdf",
    mimeType: "application/pdf",
    buffer: await pdfFixture("Page", Array.from({ length: 101 }, (_, index) => 300 + index)),
  });
  await expect(
    page.getByText("The visual page organizer supports up to 100 pages per job. This job has 101 pages.", {
      exact: true,
    })
  ).toBeVisible();
  await expect(page.getByRole("list", { name: "PDF pages" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Split PDF" })).toBeDisabled();
});
