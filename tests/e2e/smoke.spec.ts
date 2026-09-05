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
    "Free Online PDF Tools"
  );
  await expect(page.getByRole("link", { name: /Merge PDF/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /PDF to PNG/ }).first()).toBeVisible();

  const toolDirectory = page.locator("#all-tools");
  const mergeDirectoryLink = toolDirectory.locator('a[href="/merge-pdf"]');
  await expect(mergeDirectoryLink).toHaveCount(1);
  await toolDirectory.getByRole("button", { name: "Convert from PDF" }).click();
  await expect(mergeDirectoryLink).toHaveAttribute("hidden", "");
  await expect(toolDirectory.locator('a[href="/pdf-to-word"]')).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  ).toBe(true);
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

test("signup exposes accessible validation", async ({ page }) => {
  await page.goto("/signup");

  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveAttribute("autocomplete", "name");
  await expect(page.getByLabel("Email")).toHaveAttribute("autocomplete", "email");
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "autocomplete",
    "new-password"
  );
  await expect(page.getByLabel("Confirm password")).toHaveAttribute(
    "autocomplete",
    "new-password"
  );

  await page.getByLabel("Password", { exact: true }).fill("12345678");
  await page.getByLabel("Confirm password").fill("87654321");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByText("Enter your full name.")).toBeVisible();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Passwords do not match.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute(
    "href",
    "/login"
  );
});

test("login and signup put social sign-in before email and password", async ({ page }) => {
  for (const path of ["/login", "/signup"]) {
    await page.goto(path);

    const google = page.getByRole("button", { name: "Continue with Google" });
    const facebook = page.getByRole("button", { name: "Continue with Facebook" });
    const email = page.getByLabel("Email");

    await expect(page.getByRole("button", { name: "Continue with Apple" })).toHaveCount(0);
    await expect(google).toBeVisible();
    await expect(facebook).toBeVisible();
    await expect(page.getByText("or continue with email")).toBeVisible();

    for (const button of [google, facebook]) {
      expect(
        await button.evaluate((element, inputId) => {
          const input = document.getElementById(inputId);
          return Boolean(
            input &&
              element.compareDocumentPosition(input) &
                Node.DOCUMENT_POSITION_FOLLOWING
          );
        }, path === "/login" ? "login-email" : "signup-email")
      ).toBe(true);
    }
  }
});

test("login exposes accessible email and password validation", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByLabel("Email")).toHaveAttribute("autocomplete", "email");
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "autocomplete",
    "current-password"
  );
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Enter your password.")).toBeVisible();
});
