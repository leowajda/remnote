import { test, expect } from "@playwright/test";

test("touch mode switching and scrolling retain usable content", async ({
  page,
}) => {
  await page.goto("/");
  expect(
    await page.evaluate(() => matchMedia("(pointer: coarse)").matches),
  ).toBe(true);
  await page.getByRole("button", { name: "Switch to dark" }).tap();
  await expect(page.locator("#app")).toHaveClass(/dark/);
  const easy = page.getByRole("button", { name: "Easy", exact: true });
  await easy.scrollIntoViewIfNeeded();
  await easy.tap();
  const button = await easy.boundingBox();
  const navigation = await page.locator(".mobile-nav").boundingBox();
  expect(button).not.toBeNull();
  expect(navigation).not.toBeNull();
  expect(button!.y + button!.height).toBeLessThanOrEqual(navigation!.y);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("reduced motion disables button transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const transition = await page
    .getByRole("button", { name: "Primary action" })
    .evaluate((element) => getComputedStyle(element).transitionProperty);
  expect(transition).toBe("none");
});
