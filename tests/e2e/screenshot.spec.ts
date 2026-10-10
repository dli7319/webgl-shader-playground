import { expect, test } from "@playwright/test";
import { openApp } from "./support";

test("invalid screenshot filename shows an error notice", async ({ page }) => {
  await openApp(page);
  // Screenshot fields live in the CAPTURE slab — open it from its rail bracket.
  await page.getByRole("button", { name: /capture ·/i }).click();

  await page.getByLabel("Screenshot filename").fill("shot.gif");
  await page.getByRole("button", { name: /screenshot!/i }).click();

  const notice = page.getByRole("alert").filter({ hasText: "Screenshot error" });
  await expect(notice).toContainText("shot.gif");
  await expect(notice).toContainText(".png");
});

test("screenshot downloads a PNG and clears the notice", async ({ page }) => {
  await openApp(page);
  // Screenshot fields live in the CAPTURE slab — open it from its rail bracket.
  await page.getByRole("button", { name: /capture ·/i }).click();

  await page.getByLabel("Screenshot filename").fill("shot.png");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /screenshot!/i }).click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("shot.png");

  // Success toast appears and no error notice is showing.
  await expect(page.getByRole("status").last()).toContainText("Screenshot saved");
  await expect(
    page.getByRole("alert").filter({ hasText: "Screenshot error" })
  ).toHaveCount(0);
});
