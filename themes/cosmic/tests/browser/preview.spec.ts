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
        ".rn-tag, .rn-rem-reference, .rn-sidebar-counter, .rn-document-sidebar__top-link, .rn-table-header, .rn-queue__card-counter, .cloze, .rn-clr-content-on-color, .rn-settings__link, .fixture-highlight, .rn-tooltip .text-cyan-70, .rn-button--Outline .text-black",
      ),
    ].map((element) => ({
      label: element.className,
      ratio: ratio(toSrgb(colorValue(element, "color")), resolveBg(element)),
    }));
    const placeholders = [
      ...document.querySelectorAll("input[placeholder]"),
    ].map((element) => ({
      label: `placeholder: ${element.getAttribute("placeholder")}`,
      ratio: ratio(
        toSrgb(getComputedStyle(element, "::placeholder").color),
        resolveBg(element),
      ),
    }));
    const checkbox = document.querySelector(".fixture-checkbox")!;
    const checkboxContrast = {
      label: "checkbox tick (non-text indicator)",
      ratio: ratio(
        toSrgb(getComputedStyle(checkbox, "::before").borderRightColor),
        toSrgb(getComputedStyle(checkbox, "::after").backgroundColor),
      ),
    };
    const arrows = [
      ...document.querySelectorAll(".fixture-filter-scroller > button"),
    ].map((element) => ({
      label: `border: ${element.getAttribute("aria-label")}`,
      ratio: ratio(
        toSrgb(getComputedStyle(element).borderColor),
        resolveBg(element),
      ),
    }));
    return [
      body,
      ...buttons,
      ...accents,
      ...placeholders,
      switchContrast,
      checkboxContrast,
      ...arrows,
    ];
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
        check.label.includes("non-text indicator") ||
          check.label.startsWith("border:")
          ? 3
          : 4.5,
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

for (const mode of ["light", "dark"] as const) {
  test(`${mode} body-scoped host styles cannot replace the palette or on-color text`, async ({
    page,
  }) => {
    // RemNote 1.30 uses :root body.<mode>, not just the preview's mode wrapper.
    // Load representative host rules AFTER the theme to exercise specificity.
    await page.addStyleTag({
      content: `
        :root body.dark, :root body.light {
          --rn-clr-background-primary: #202024;
          --rn-clr-content-on-color: #fff;
          --rn-clr-background-accent: #4b69ff;
          --rn-clr-background-accent--hovered: linear-gradient(#4b69ff, #4b69ff);
          --rn-clr-background-elevation-10: linear-gradient(#29292e, #29292e);
        }
      `,
    });
    await page.evaluate((mode) => {
      document.querySelector("#app")!.className = "";
      document.body.className = mode;
    }, mode);
    const exportButton = page.getByRole("button", {
      name: "Export",
      exact: true,
    });
    await expect(page.locator("#app")).toHaveCSS(
      "background-color",
      mode === "dark" ? "rgb(27, 27, 27)" : "rgb(215, 215, 215)",
    );
    await expect(exportButton).toHaveCSS(
      "background-color",
      mode === "dark" ? "rgb(99, 208, 223)" : "rgb(0, 82, 90)",
    );
    for (const state of ["rest", "hover", "pressed"]) {
      if (state === "hover") await exportButton.hover();
      if (state === "pressed") await page.mouse.down();
      await expect(exportButton).toHaveCSS("background-image", "none");
      await expectTextContrast(
        page,
        "rn-clr-content-on-color dark:rn-clr-content-primary",
      );
    }
    await page.mouse.up();
    const colors = await page.evaluate(() => {
      const root = getComputedStyle(document.body);
      return ["--rn-colors-blue-50", "--rn-clr-background-accent"].map(
        (name) => {
          const probe = document.createElement("span");
          probe.style.color = root.getPropertyValue(name);
          document.body.append(probe);
          const color = getComputedStyle(probe).color;
          probe.remove();
          return color;
        },
      );
    });
    expect(colors[0]).toBe(colors[1]);
  });

  test(`${mode} selected settings remain readable on hover with one interaction accent`, async ({
    page,
  }) => {
    if (mode === "dark")
      await page.getByRole("button", { name: "Switch to dark" }).click();
    const selected = page.getByRole("link", {
      name: "Appearance",
      exact: true,
    });
    await selected.hover();
    await expectTextContrast(page, "rn-settings__link rn-clr-content-accent");
    await expect(selected).toHaveCSS("background-image", "none");
    const colors = await page.evaluate(() =>
      [
        ".rn-settings__link[aria-current]",
        ".rn-nav-tab-button[aria-selected=true]",
        ".rn-rem-reference",
      ].map(
        (selector) => getComputedStyle(document.querySelector(selector)!).color,
      ),
    );
    expect(new Set(colors).size).toBe(1);
  });

  test(`${mode} filter arrows stay readable and leave labels unobscured`, async ({
    page,
  }) => {
    if (mode === "dark")
      await page.getByRole("button", { name: "Switch to dark" }).click();
    const right = page.getByRole("button", {
      name: "Scroll right",
      exact: true,
    });
    const left = page.getByRole("button", { name: "Scroll left", exact: true });
    await expect(page.locator(".fixture-scroll-fade")).toBeHidden();
    const list = await page.locator(".no-horizontal-scroll").boundingBox();
    const rightBox = await right.boundingBox();
    const leftBox = await left.boundingBox();
    expect(list!.x + list!.width).toBeLessThanOrEqual(rightBox!.x);
    expect(list!.x).toBeGreaterThanOrEqual(leftBox!.x + leftBox!.width);
    await right.hover();
    await expectTextContrast(page, "›");
    await right.click();
    await expect
      .poll(() =>
        page.locator(".no-horizontal-scroll").evaluate((e) => e.scrollLeft),
      )
      .toBeGreaterThan(0);
    await left.click();
    await expect
      .poll(() =>
        page.locator(".no-horizontal-scroll").evaluate((e) => e.scrollLeft),
      )
      .toBe(0);
    await page.keyboard.press("Tab");
    await expect(right).toBeFocused();
    await expect(right).toHaveCSS("outline-style", "solid");
  });

  test(`${mode} host tooltips are flat and authored cloze highlights survive`, async ({
    page,
  }) => {
    if (mode === "dark")
      await page.getByRole("button", { name: "Switch to dark" }).click();
    await expect(page.locator(".rn-tooltip")).toHaveCSS(
      "background-image",
      "none",
    );
    const highlight = await page
      .locator(".highlight-color--yellow")
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor);
    await expect(page.locator(".cloze.has-highlight-color")).toHaveCSS(
      "background-color",
      highlight,
    );
    for (const name of ["Create", "Again", "Good", "Easy"]) {
      const button = page.getByRole("button", { name, exact: true });
      await button.hover();
      await expectTextContrast(page, name);
      await page.mouse.down();
      await expectTextContrast(page, name);
      await page.mouse.up();
    }
  });
}

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
      // Collect every mode/viewport diff in one run, while still failing the test.
      await expect.soft(page).toHaveScreenshot(`cosmic-${label}-${mode}.png`, {
        fullPage: label === "desktop",
      });
      if (mode === "dark")
        await page.getByRole("button", { name: "Switch to light" }).click();
    }
  }
});
