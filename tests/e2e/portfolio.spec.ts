import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { publicRoutes } from "../../src/routes";

for (const route of publicRoutes) {
  test(`prerendered route ${route.path}`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", route.locale);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new URL(route.path, "https://musyg.github.io").toString(),
    );
  });
}

test("language switch keeps the matching page context", async ({ page }) => {
  await page.goto("/work/celo-credentials/");
  await page.getByRole("link", { name: "View this page in French" }).click();
  await expect(page).toHaveURL(/\/fr\/realisations\/celo-credentials\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

test("work filters are reflected in the URL and the visible cards", async ({
  page,
}) => {
  await page.goto("/work/");
  await page.getByRole("button", { name: "AI systems" }).click();
  await expect(page).toHaveURL(/filter=ai/);
  await expect(
    page.getByRole("button", { name: /AI systems/, pressed: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", { name: "Agent Resilience" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "MikasShop" })).toHaveCount(0);
});

test("mobile menu opens, closes with Escape, and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#mobile-navigation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-navigation")).toBeHidden();
  await expect(menu).toBeFocused();
});

test("favicon and social-preview metadata are wired", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/favicon.svg",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://musyg.github.io/social-preview.png",
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
    "content",
    "1200",
  );
  await expect(
    page.locator('meta[property="og:image:height"]'),
  ).toHaveAttribute("content", "630");
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    "content",
    /Gilles Musy portfolio/,
  );
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
    "content",
    /Gilles Musy portfolio/,
  );
});

test("the approved compact mark preserves the semantic header wordmark", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const wordmark = page.getByRole("link", { name: "Gilles Musy, home" });
  const mark = wordmark.locator(".header-mark");
  await expect(wordmark).toContainText("Gilles Musy");
  await expect(mark).toHaveAttribute("src", "/header-mark.svg");
  await expect(mark).toHaveJSProperty("complete", true);
  await expect(mark).toHaveCSS("width", "28px");
  await expect(mark).toHaveCSS("height", "28px");

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(mark).toHaveCSS("width", "26px");
  await expect(mark).toHaveCSS("height", "26px");

  await page.setViewportSize({ width: 320, height: 700 });
  await expect(mark).toHaveCSS("width", "26px");
  await expect(mark).toHaveCSS("height", "26px");
  await expect(page.locator("body")).toHaveCSS("min-width", "0px");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
});

test("the bounded hero refinement preserves hierarchy and responsive actions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const title = page.locator("#hero-title");
  const titleLines = title.locator("span");
  const primary = page.getByRole("link", { name: "View work" });
  const secondary = page.getByRole("link", { name: "Explore expertise" });

  await expect(titleLines).toHaveCount(3);
  await expect(title).toHaveCSS("font-size", "61.2px");
  await expect(page.locator(".hero-trace-desktop")).toBeVisible();
  await expect(page.locator(".hero-trace-mobile")).toBeHidden();
  await expect(primary).toHaveCSS("background-color", "rgba(0, 94, 255, 0.86)");
  await expect(primary).toHaveCSS("border-color", "rgb(0, 94, 255)");
  await expect(secondary).toHaveCSS(
    "background-color",
    "rgba(21, 26, 33, 0.72)",
  );
  await expect(secondary).toHaveCSS("border-color", "rgb(102, 125, 141)");

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(title).toHaveCSS("font-size", "35.1px");
  await expect(page.locator(".hero-trace-desktop")).toBeHidden();
  await expect(page.locator(".hero-trace-mobile")).toBeVisible();
  for (const action of [primary, secondary]) {
    expect(
      await action.evaluate(
        (element) =>
          element.scrollWidth <= element.clientWidth &&
          element.scrollHeight <= element.clientHeight,
      ),
    ).toBe(true);
  }

  await page.goto("/fr/");
  const frenchTitle = page.locator("#hero-title");
  const frenchLines = frenchTitle.locator("span");
  const frenchPrimary = page.getByRole("link", {
    name: "Voir les réalisations",
  });
  const frenchSecondary = page.getByRole("link", {
    name: "Explorer les expertises",
  });
  await expect(frenchLines).toHaveCount(3);
  await expect(frenchTitle).toHaveCSS("font-size", "35.1px");
  for (const line of await frenchLines.all()) {
    expect(
      await line.evaluate((element) => {
        const styles = getComputedStyle(element);
        return (
          element.getBoundingClientRect().height <=
          Number.parseFloat(styles.lineHeight) + 1
        );
      }),
    ).toBe(true);
  }
  for (const action of [frenchPrimary, frenchSecondary]) {
    expect(
      await action.evaluate(
        (element) =>
          element.scrollWidth <= element.clientWidth &&
          element.scrollHeight <= element.clientHeight,
      ),
    ).toBe(true);
  }

  await page.setViewportSize({ width: 320, height: 700 });
  await expect(frenchTitle).toHaveCSS("font-size", "28.8px");
  for (const line of await frenchLines.all()) {
    expect(
      await line.evaluate((element) => {
        const styles = getComputedStyle(element);
        return (
          element.getBoundingClientRect().height <=
          Number.parseFloat(styles.lineHeight) + 1
        );
      }),
    ).toBe(true);
  }
  const primaryBox = await frenchPrimary.boundingBox();
  const secondaryBox = await frenchSecondary.boundingBox();
  expect(primaryBox).not.toBeNull();
  expect(secondaryBox).not.toBeNull();
  expect(secondaryBox!.y).toBeGreaterThan(primaryBox!.y + primaryBox!.height);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.locator(".hero-trace-mobile .hero-trace").first(),
  ).toBeHidden();
});

test("the review identity appears only on the bilingual Security Reviews case study", async ({
  page,
}) => {
  for (const path of [
    "/work/security-reviews/",
    "/fr/realisations/security-reviews/",
  ]) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    const mark = page.locator(".security-review-case-mark");
    await expect(mark).toHaveCount(1);
    await expect(mark).toBeVisible();
    await expect(mark).toHaveAttribute("src", "/security-review-mark.svg");
    await expect(mark).toHaveAttribute("alt", "");
    await expect(mark).toHaveAttribute("aria-hidden", "true");
    await expect(mark).toHaveJSProperty("complete", true);
    expect(await mark.evaluate((image) => image.naturalWidth)).toBe(48);
    await expect(mark).toHaveCSS("width", "48px");
    await expect(mark).toHaveCSS("height", "48px");

    await page.setViewportSize({ width: 320, height: 700 });
    await expect(mark).toHaveCSS("width", "34px");
    await expect(mark).toHaveCSS("height", "34px");
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
  }

  await page.goto("/work/celo-credentials/");
  await expect(page.locator(".security-review-case-mark")).toHaveCount(0);
  await page.goto("/work/");
  await expect(page.locator(".security-review-case-mark")).toHaveCount(0);
  await expect(page.locator(".header-mark")).toHaveAttribute(
    "src",
    "/header-mark.svg",
  );
});

test("the bilingual About principles keep spacing outside the divider surface", async ({
  page,
}) => {
  const viewports = [
    { width: 1440, height: 900, margin: 136 },
    { width: 960, height: 800, margin: 96 },
    { width: 520, height: 800, margin: 84 },
    { width: 390, height: 844, margin: 84 },
    { width: 320, height: 700, margin: 84 },
  ];

  for (const path of ["/about/", "/fr/a-propos/"]) {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(path);
      const grid = page.locator(".principles-grid");
      const layout = await grid.evaluate((element) => {
        const articles = [...element.querySelectorAll(":scope > article")];
        const gridRect = element.getBoundingClientRect();
        const firstRect = articles[0].getBoundingClientRect();
        const lastRect = articles.at(-1)!.getBoundingClientRect();
        const style = getComputedStyle(element);

        return {
          articleCount: articles.length,
          background: style.backgroundColor,
          marginTop: Number.parseFloat(style.marginTop),
          marginBottom: Number.parseFloat(style.marginBottom),
          paddingTop: Number.parseFloat(style.paddingTop),
          paddingBottom: Number.parseFloat(style.paddingBottom),
          topGap: firstRect.top - gridRect.top,
          bottomGap: gridRect.bottom - lastRect.bottom,
        };
      });

      expect(layout.articleCount).toBe(3);
      expect(layout.background).toBe("rgb(37, 48, 58)");
      expect(layout.marginTop).toBeCloseTo(viewport.margin, 0);
      expect(layout.marginBottom).toBeCloseTo(viewport.margin, 0);
      expect(layout.paddingTop).toBe(0);
      expect(layout.paddingBottom).toBe(0);
      expect(layout.topGap).toBeLessThanOrEqual(1.5);
      expect(layout.bottomGap).toBeLessThanOrEqual(1.5);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
    }
  }
});

test("dark backgrounds only across representative routes and viewports", async ({
  page,
}) => {
  const allowedBackgrounds = [
    "rgba(0, 0, 0, 0)",
    "rgba(0, 94, 255, 0.86)",
    "rgba(21, 26, 33, 0.72)",
    "rgb(15, 18, 22)",
    "rgb(21, 26, 33)",
    "rgb(37, 48, 58)",
    "rgb(0, 94, 255)",
  ];

  for (const viewport of [
    { width: 320, height: 700 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    for (const path of ["/", "/work/celo-credentials/", "/fr/contact/"]) {
      await page.goto(path);
      const result = await page.locator("*").evaluateAll(
        (elements, allowed) =>
          elements
            .map((element) => ({
              element: element.tagName.toLowerCase(),
              classes: element.getAttribute("class"),
              color: getComputedStyle(element).backgroundColor,
            }))
            .filter((entry) => !allowed.includes(entry.color))
            .slice(0, 10),
        allowedBackgrounds,
      );
      expect(result).toEqual([]);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    }
  }
});

for (const path of ["/", "/fr/", "/work/celo-credentials/", "/fr/contact/"]) {
  test(`@a11y automated accessibility scan ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
