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

test("dark backgrounds only across representative routes and viewports", async ({
  page,
}) => {
  const allowedBackgrounds = [
    "rgba(0, 0, 0, 0)",
    "rgb(15, 18, 22)",
    "rgb(21, 26, 33)",
    "rgb(37, 48, 58)",
    "rgb(0, 94, 255)",
  ];

  for (const viewport of [
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
