import { expect, test } from "@playwright/test";

test("account requires server-side authentication and invalid callbacks stay internal", async ({ request }) => {
  const account = await request.get("/account", { maxRedirects: 0 });
  expect(account.status()).toBe(307);
  expect(account.headers().location).toBe("/login?redirect=/account");
  const callback = await request.get("/auth/callback?error=access_denied&next=https://evil.example", { maxRedirects: 0 });
  expect(callback.status()).toBe(307);
  expect(new URL(callback.headers().location).pathname).toBe("/login");
  expect(callback.headers()["cache-control"]).toContain("no-store");
});

test("both forms start the same PKCE flow for Google and Facebook", async ({ page }) => {
  for (const path of ["/login", "/signup"]) {
    for (const provider of ["Google", "Facebook"]) {
      await page.goto(path);
      await page.route("**/auth/v1/authorize?**", (route) => route.fulfill({ contentType: "text/html", body: "Provider redirect intercepted" }));
      const outbound = page.waitForRequest("**/auth/v1/authorize?**");
      await page.getByRole("button", { name: `Continue with ${provider}` }).click();
      const url = new URL((await outbound).url());
      expect(url.searchParams.get("provider")).toBe(provider.toLowerCase());
      expect(url.searchParams.get("code_challenge")).toBeTruthy();
      const callback = new URL(url.searchParams.get("redirect_to")!);
      expect(callback.pathname).toBe("/auth/callback");
      expect(callback.searchParams.get("next")).toBe("/account");
      await page.waitForLoadState();
    }
  }
});

test("login translates rejected credentials", async ({ page }) => {
  await page.route("**/auth/v1/token?**", (route) => route.fulfill({
    status: 400, json: { code: "invalid_credentials", msg: "Invalid login credentials" },
  }));
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill("person@example.com");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Incorrect email or password.");
  await expect(page.getByRole("button", { name: "Sign In", exact: true })).toBeEnabled();
});

test("signup without a session asks for email confirmation", async ({ page }) => {
  await page.route("**/auth/v1/signup**", (route) => route.fulfill({
    json: { id: "test-user", email: "person@example.com", identities: [{ provider: "email" }] },
  }));
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("Test User");
  await page.getByLabel("Email", { exact: true }).fill("person@example.com");
  await page.getByLabel("Password", { exact: true }).fill("long-enough-password");
  await page.getByLabel("Confirm password").fill("long-enough-password");
  await page.getByRole("button", { name: "Create Account", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  await expect(page).toHaveURL(/\/signup$/);
});

test("password recovery requests a PKCE email and rejects unauthenticated reset", async ({ page }) => {
  await page.route("**/auth/v1/recover**", (route) => {
    expect(new URL(route.request().url()).searchParams.get("redirect_to")).toContain("/auth/reset-password");
    expect(route.request().postDataJSON().code_challenge).toBeTruthy();
    return route.fulfill({ json: {} });
  });
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(page.getByRole("heading", { name: "Forgot password?" })).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill("person@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText("If an account exists");
  await page.goto("/auth/reset-password");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("invalid or has expired");
});
