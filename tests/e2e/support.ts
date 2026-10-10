import { expect, type Page } from "@playwright/test";

/** Collects uncaught page errors seen during a test. */
export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  return errors;
}

/** Opens the app and waits for the preview canvas to mount. */
export async function openApp(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByRole("img", { name: "Shader preview output" })).toBeVisible();
}

/**
 * Opens a collapsed right-rail HUD module by its readout header (the layout
 * keeps secondary config behind state-reporting disclosures).
 */
export async function openModule(page: Page, name: RegExp): Promise<void> {
  const header = page.getByRole("button", { name });
  if ((await header.getAttribute("aria-expanded")) !== "true") {
    await header.click();
  }
  await expect(header).toHaveAttribute("aria-expanded", "true");
}
