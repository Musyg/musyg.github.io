import { mkdirSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const locale of ["fr", "en"]) {
  for (const width of [1440, 390, 320]) {
    test(`memory evidence hierarchy ${locale} at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(
        `${locale === "fr" ? "/fr/realisations" : "/work"}/persistent-memory/`,
      );
      await expect(page.locator(".case-actions a")).toHaveCount(3);
      const sections = page.locator(".case-body > section");
      await expect(sections.nth(1)).toHaveAttribute(
        "aria-labelledby",
        "persistent-memory-results",
      );
      await page
        .locator('.case-actions a[href="#persistent-memory-results"]')
        .click();
      await expect(page).toHaveURL(/#persistent-memory-results$/);
      const priorities = page.locator(".memory-priorities > li");
      await expect(priorities).toHaveCount(3);
      await expect(priorities.nth(0)).toContainText(/77.*96.*29\/96/);
      await expect(priorities.nth(1)).toContainText(
        /Luna.*22.*24.*13\/24.*7\/24/,
      );
      await expect(priorities.nth(2)).toContainText(/751.*389.*SQLite/);
      const disclosure = page.locator(".memory-measurements");
      await expect(disclosure).not.toHaveAttribute("open", "");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const screenshotDirectory = process.env.MEMORY_HIERARCHY_SCREENSHOT_DIR;
      if (screenshotDirectory)
        mkdirSync(screenshotDirectory, { recursive: true });
      const screenshotPath = (state: string) =>
        screenshotDirectory
          ? join(
              screenshotDirectory,
              `memory-hierarchy-${locale}-${width}-${state}.png`,
            )
          : testInfo.outputPath(
              `memory-hierarchy-${locale}-${width}-${state}.png`,
            );
      await page.screenshot({ path: screenshotPath("closed"), fullPage: true });
      const summary = disclosure.locator("summary");
      await summary.focus();
      await summary.press("Enter");
      await expect(disclosure).toHaveAttribute("open", "");
      await expect(disclosure).toContainText("0.3.0a5");
      await expect(disclosure).toContainText(/6[.,]79/);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await summary.press("Enter");
      await expect(disclosure).not.toHaveAttribute("open", "");
    });
  }
  test(`memory evidence hierarchy ${locale} @a11y`, async ({ page }) => {
    await page.goto(
      `${locale === "fr" ? "/fr/realisations" : "/work"}/persistent-memory/`,
    );
    for (const expanded of [false, true]) {
      if (expanded)
        await page.locator(".memory-measurements > summary").click();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
  });
}
