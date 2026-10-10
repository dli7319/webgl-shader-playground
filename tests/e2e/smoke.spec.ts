import { expect, test } from "@playwright/test";
import { collectPageErrors, openApp } from "./support";

test("app boots with preview, editor, and controls", async ({ page }) => {
  const errors = collectPageErrors(page);
  await openApp(page);

  await expect(page.getByRole("button", { name: /run shader/i })).toBeVisible();
  await expect(page.getByRole("region", { name: "Shader editor" })).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Compiled" }).first()
  ).toBeVisible();

  // Secondary config lives in the right-side sheet; the summary chip beside
  // its opener reports the hidden output state and opens the sheet.
  await expect(page.getByRole("button", { name: /open output settings/i })).toBeVisible();
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("button", { name: /screenshot!/i })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  // The preview canvas has a real drawing surface sized to the layout.
  const canvas = page.locator("canvas").first();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(100);
  expect(box!.height).toBeGreaterThan(100);

  // A rendered photo does not compress like a blank canvas.
  const png = await canvas.screenshot();
  expect(png.byteLength).toBeGreaterThan(10_000);

  expect(errors).toEqual([]);
});

test("theme toggle switches the document theme", async ({ page }) => {
  await openApp(page);
  await page.getByRole("button", { name: /dark theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: /light theme/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
