import { expect, test } from "@playwright/test";
import { openApp } from "./support";

test("settings persist across a full reload", async ({ page }) => {
  await openApp(page);

  await page.getByRole("button", { name: "Settings" }).click();
  const dialog = page.getByRole("dialog", { name: "Settings" });
  await expect(dialog).toBeVisible();

  // Dark theme via the settings dialog (toggle button: "Dark theme").
  await dialog.getByRole("button", { name: "Dark theme" }).click();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  // The editor is clean (nothing to lose), so reload is unguarded.
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  // Font size persisted too: change it, reload, read it back from the dialog.
  await page.getByRole("button", { name: "Settings" }).click();
  const fontSize = page.getByLabel("Editor font size");
  await fontSize.fill("20");
  await page
    .getByRole("dialog", { name: "Settings" })
    .getByRole("button", { name: "Close" })
    .click();

  await page.reload();
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByLabel("Editor font size")).toHaveValue("20");
});
