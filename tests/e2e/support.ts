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
