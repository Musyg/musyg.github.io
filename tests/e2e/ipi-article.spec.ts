import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ipiArticle } from "../../src/content/ipi-article";

for (const locale of ["en", "fr"] as const) {
  for (const width of [390, 1440]) {
    test(`IPI article ${locale} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(ipiArticle[locale].path);
      await expect(page.locator("h1")).toHaveText(ipiArticle[locale].title);
      await expect(page.locator("article blockquote")).toContainText(
        "correct parameters",
      );
      await page.locator("article figure").scrollIntoViewIfNeeded();
      await expect(page.locator("article img")).toBeVisible();
      expect(
        await page
          .locator("article img")
          .evaluate(
            (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
          ),
      ).toBeTruthy();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBeTruthy();
      await expect(page.locator("article a[href='#verdict']")).toHaveCount(1);
    });
  }
  test(`IPI article ${locale} @a11y`, async ({ page }) => {
    await page.goto(ipiArticle[locale].path);
    const scan = await new AxeBuilder({ page }).analyze();
    expect(scan.violations).toEqual([]);
  });
}
