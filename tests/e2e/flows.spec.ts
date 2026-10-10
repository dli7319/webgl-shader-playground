import { expect, test } from "@playwright/test";
import { openApp } from "./support";

test("download shader exports the editor source", async ({ page }) => {
  await openApp(page);
  // Download lives in the SOURCE FILE slab — open it from its rail bracket.
  await page.getByRole("button", { name: /source file ·/i }).click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /download shader/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("fragment.frag");
  await expect(page.getByRole("status").last()).toContainText("Shader downloaded");
});

test("picking a texture image updates the preview without errors", async ({ page }) => {
  await openApp(page);
  const canvas = page.locator("canvas").first();
  const before = await canvas.screenshot();

  // A tiny 2x2 red PNG — the preview should retexture with it.
  const redPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEUlEQVR4nGP8z8Dwn4GBgYEJAAAWAQMDNTXnWAAAAABJRU5ErkJggg==",
    "base64"
  );
  // The texture pick lives in the TEXTURE slab — open it from its rail bracket.
  await page.getByRole("button", { name: /texture ·/i }).click();
  await page.getByLabel("Choose a texture image").setInputFiles({
    name: "texture.png",
    mimeType: "image/png",
    buffer: redPng,
  });

  await expect(page.getByRole("alert").filter({ hasText: "Texture error" })).toHaveCount(
    0
  );
  await expect.poll(async () => (await canvas.screenshot()).equals(before)).toBe(false);
});

test("zoom controls resize the preview canvas", async ({ page }) => {
  await openApp(page);
  const canvas = page.locator("canvas").first();
  const initial = (await canvas.boundingBox())!.width;

  // The zoom cluster is disclosed from the SPECIMEN caption summary.
  await page.getByRole("button", { name: /zoom ·/i }).click();
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect
    .poll(async () => (await canvas.boundingBox())!.width)
    .toBeGreaterThan(initial);

  await page.getByRole("button", { name: "Fit" }).click();
  await expect
    .poll(async () => (await canvas.boundingBox())!.width)
    .toBeCloseTo(initial, 0);
});
