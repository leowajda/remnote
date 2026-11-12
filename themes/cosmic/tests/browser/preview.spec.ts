import { expect, test, type Page } from "@playwright/test";

const widths = [360, 390, 768, 1280];

async function contrastChecks(page: Page) {
  return page.evaluate(() => {
    type RGBA = [number, number, number, number];
    const colorValue = (
      element: Element,
      property: "color" | "backgroundColor",
    ) => getComputedStyle(element)[property];
    const toSrgb = (color: string): RGBA => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context)
        throw new Error(
          "Canvas 2D context is required to inspect computed colors.",
        );
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const data = context.getImageData(0, 0, 1, 1).data;
      return [data[0]!, data[1]!, data[2]!, data[3]! / 255];
    };
    const luminance = (color: number[]) => {
      const linear = color.slice(0, 3).map((channel) => {
        const value = channel / 255;
        return value <= 0.04045
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
    };
    const ratio = (a: number[], b: number[]) => {
      const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (values[0]! + 0.05) / (values[1]! + 0.05);
    };
    const resolveBg = (element: Element): number[] => {
      const bg = toSrgb(colorValue(element, "backgroundColor"));
      if (bg[3] >= 1) return bg;
      const parent = element.parentElement;
      const under = parent ? resolveBg(parent) : [255, 255, 255, 1];
      const alpha = bg[3];
      return [
        bg[0] * alpha + under[0]! * (1 - alpha),
        bg[1] * alpha + under[1]! * (1 - alpha),
        bg[2] * alpha + under[2]! * (1 - alpha),
        1,
      ];
    };
    const root = document.querySelector("#app")!;
    const body = {
      label: "preview body",
      ratio: ratio(toSrgb(colorValue(root, "color")), resolveBg(root)),
    };
    const buttons = [
      ...document.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
    ]
      .filter((button) => button.innerText.trim().length > 0)
      .map((button) => ({
        label: button.innerText.trim(),
        ratio: ratio(toSrgb(colorValue(button, "color")), resolveBg(button)),
      }));
    const switchControl = document.querySelector('[role="switch"]')!;
    const switchThumb = switchControl.querySelector(".rn-switch-handle")!;
    const switchContrast = {
      label: "switch thumb against track (non-text indicator)",
      ratio: ratio(resolveBg(switchThumb), resolveBg(switchControl)),
    };
    const accents = [
      ...document.querySelectorAll(
        ".rn-tag, .rn-rem-reference, .rn-sidebar-counter, .rn-document-sidebar__top-link, .rn-table-header, .rn-queue__card-counter, .cloze",
      ),
    ].map((element) => ({
      label: element.className,
      ratio: ratio(toSrgb(colorValue(element, "color")), resolveBg(element)),
    }));
    return [body, ...buttons, ...accents, switchContrast];
  });
}

async function expectTextContrast(page: Page, label: string, minimum = 4.5) {
  const check = (await contrastChecks(page)).find(
    (item) => item.label === label,
  );
  expect(check, `${label} contrast sample should exist`).toBeDefined();
  expect(
    check!.ratio,
    `${label}: ${check!.ratio.toFixed(2)}:1`,
  ).toBeGreaterThanOrEqual(minimum);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("wrapper mode switch changes theme tokens and leaves reader paper unchanged", async ({
  page,
}) => {
  const app = page.locator("#app");
  const reader = page.locator(".reader-page");
  const light = await app.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    text: getComputedStyle(element).color,
  }));
  const readerLight = await reader.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    text: getComputedStyle(element).color,
    cloze: getComputedStyle(element.querySelector(".cloze")!).color,
  }));
  await page.getByRole("button", { name: "Switch to dark" }).click();
  await expect(app).toHaveClass(/\bdark\b/);
  const dark = await app.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    text: getComputedStyle(element).color,
  }));
  const readerDark = await reader.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    text: getComputedStyle(element).color,
    cloze: getComputedStyle(element.querySelector(".cloze")!).color,
  }));
  expect(dark.background).not.toBe(light.background);
  expect(dark.text).not.toBe(light.text);
  expect(readerDark).toEqual(readerLight);
  expect(await reader.innerText()).toContain("Cellular energy");
});

test("wrapper mode switch restores the original light colors", async ({
  page,
}) => {
  const app = page.locator("#app");
  const light = await app.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    text: getComputedStyle(element).color,
  }));
  await page.getByRole("button", { name: "Switch to dark" }).click();
  await page.getByRole("button", { name: "Switch to light" }).click();
  const restored = await app.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    text: getComputedStyle(element).color,
  }));
  expect(restored).toEqual(light);
});

test("floating toolbar wrapper stays transparent", async ({ page }) => {
  const alpha = await page
    .locator(".rn-floating-toolbar-wrapper")
    .evaluate((element) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas 2D context is required.");
      context.fillStyle = getComputedStyle(element).backgroundColor;
      context.fillRect(0, 0, 1, 1);
      return context.getImageData(0, 0, 1, 1).data[3]!;
    });
  expect(alpha).toBe(0);
});

for (const width of widths) {
  test(`no horizontal overflow at ${width}px in either theme mode`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const mode of ["light", "dark"]) {
      if (mode === "dark")
        await page.getByRole("button", { name: "Switch to dark" }).click();
      const sizes = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
        app: document.querySelector("#app")!.scrollWidth,
      }));
      expect(
        sizes.document,
        `${mode} document at ${width}px`,
      ).toBeLessThanOrEqual(sizes.viewport);
      expect(sizes.app, `${mode} preview at ${width}px`).toBeLessThanOrEqual(
        sizes.viewport,
      );
      if (mode === "dark")
        await page.getByRole("button", { name: "Switch to light" }).click();
    }
  });
}

for (const mode of ["light", "dark"]) {
  test(`${mode} body and enabled buttons meet normal-text contrast`, async ({
    page,
  }) => {
    if (mode === "dark")
      await page.getByRole("button", { name: "Switch to dark" }).click();
    const checks = await contrastChecks(page);
    for (const check of checks)
      expect(
        check.ratio,
        `${check.label}: ${check.ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(
        check.label.startsWith("switch thumb") ? 3 : 4.5,
      );
  });
}

for (const mode of ["light", "dark"]) {
  test(`${mode} primary action hover and pressed text meets 4.5:1 contrast`, async ({
    page,
  }) => {
    if (mode === "dark")
      await page.getByRole("button", { name: "Switch to dark" }).click();
    const primary = page.getByRole("button", { name: "Primary action" });
    await primary.hover();
    await expectTextContrast(page, "Primary action");
    await page.mouse.down();
    await expectTextContrast(page, "Primary action");
    await page.mouse.up();
  });
}

test("disabled button background does not change on hover", async ({
  page,
}) => {
  const disabled = page.getByRole("button", { name: "Disabled" });
  const before = await disabled.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await disabled.hover();
  const after = await disabled.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(after).toBe(before);
});

test("keyboard focus is visible on the primary action", async ({ page }) => {
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const primary = page.getByRole("button", { name: "Primary action" });
  await expect(primary).toBeFocused();
  const outline = await primary.evaluate(
    (element) => getComputedStyle(element).outlineStyle,
  );
  expect(outline).not.toBe("none");
});

test("desktop and mobile visual snapshots", async ({ page, browserName }) => {
  test.skip(
    browserName !== "chromium",
    "Visual baselines are maintained with Chromium only.",
  );
  for (const [label, width] of [
    ["desktop", 1280],
    ["mobile", 390],
  ] as const) {
    await page.setViewportSize({
      width,
      height: label === "desktop" ? 900 : 844,
    });
    for (const mode of ["light", "dark"] as const) {
      if (mode === "dark")
        await page.getByRole("button", { name: "Switch to dark" }).click();
      await expect(page).toHaveScreenshot(`cosmic-${label}-${mode}.png`, {
        fullPage: label === "desktop",
      });
      if (mode === "dark")
        await page.getByRole("button", { name: "Switch to light" }).click();
    }
  }
});
