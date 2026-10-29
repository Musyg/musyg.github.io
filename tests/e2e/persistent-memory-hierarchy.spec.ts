import { mkdirSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator } from "@playwright/test";

// Visibility alone does not detect a sticky header covering text or a link.
async function expectUncovered(locator: Locator) {
  await expect(locator).toBeVisible();
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        // Native focus scrolling can leave a fractional CSS pixel at a viewport
        // edge. Allow at most one pixel; every inset hit-test must still pass.
        if (
          rect.left < -1 ||
          rect.top < -1 ||
          rect.right > innerWidth + 1 ||
          rect.bottom > innerHeight + 1
        )
          return false;
        return [
          rect.left + 1,
          (rect.left + rect.right) / 2,
          rect.right - 1,
        ].every((x) =>
          [rect.top + 1, (rect.top + rect.bottom) / 2, rect.bottom - 1].every(
            (y) => {
              const top = document.elementFromPoint(x, y);
              return top === element || element.contains(top);
            },
          ),
        );
      }),
    )
    .toBe(true);
}

for (const locale of ["fr", "en"]) {
  for (const width of [1440, 390, 320]) {
    test(`memory evidence hierarchy ${locale} at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const path = `${locale === "fr" ? "/fr/realisations" : "/work"}/persistent-memory/`;
      await page.goto(path);
      // Exercise the real skip link, rather than hiding it for screenshots.
      const skip = page.locator(".skip-link");
      await page.keyboard.press("Tab");
      await expect(skip).toBeFocused();
      await expectUncovered(skip);
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/#main$/);
      await expect(skip).not.toBeFocused();
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
      await expectUncovered(page.locator("#persistent-memory-results"));
      const priorities = page.locator(".memory-priorities > li");
      await expect(priorities).toHaveCount(3);
      await expect(priorities.nth(0)).toContainText(/77.*96.*29\/96/);
      await expect(priorities.nth(1)).toContainText(
        /Luna.*22.*24.*13\/24.*7\/24/,
      );
      await expect(priorities.nth(2)).toContainText(/751.*389.*SQLite/);
      await expectUncovered(priorities.nth(0).locator("h3"));
      // Native fragment navigation sets the tab starting point at the results.
      // Check every study link after the browser's own keyboard scrolling.
      for (const priority of await priorities.all()) {
        await page.keyboard.press("Tab");
        const link = priority.locator("a");
        await expect(link).toBeFocused();
        await expectUncovered(link);
      }
      await page
        .locator('.case-toc a[href="#persistent-memory-results"]')
        .click();
      await expectUncovered(page.locator("#persistent-memory-results"));
      await page.goto(`${path}#persistent-memory-results`);
      await expectUncovered(page.locator("#persistent-memory-results"));
      await expectUncovered(priorities.nth(0).locator("h3"));
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
      // Capture a fresh initial reading state, independent of keyboard/anchor
      // checks above. Keep the actual viewport, CSS, header and skip link.
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
      await expect(skip).not.toBeFocused();
      const clip = await page.locator(".memory-priorities").evaluate((list) => {
        const rect = list.getBoundingClientRect();
        const x = Math.floor(rect.left + scrollX);
        const y = Math.floor(rect.top + scrollY);
        return {
          x,
          y,
          width: Math.ceil(rect.right + scrollX) - x,
          height: Math.ceil(rect.bottom + scrollY) - y,
        };
      });
      // All three complete results must be inside the exported document crop.
      const contentBounds = await page
        .locator(".memory-priorities :is(h3, p, a)")
        .evaluateAll((elements) =>
          elements.map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              left: rect.left + scrollX,
              top: rect.top + scrollY,
              right: rect.right + scrollX,
              bottom: rect.bottom + scrollY,
            };
          }),
        );
      expect(contentBounds).toHaveLength(12);
      for (const bounds of contentBounds) {
        expect(bounds.left).toBeGreaterThanOrEqual(clip.x);
        expect(bounds.top).toBeGreaterThanOrEqual(clip.y);
        expect(bounds.right).toBeLessThanOrEqual(clip.x + clip.width);
        expect(bounds.bottom).toBeLessThanOrEqual(clip.y + clip.height);
      }
      const overlappingOverlays = await page.evaluate((crop) => {
        return Array.from(document.body.querySelectorAll("*")).flatMap(
          (element) => {
            const style = getComputedStyle(element);
            if (
              !["fixed", "sticky"].includes(style.position) ||
              style.visibility === "hidden" ||
              style.display === "none"
            )
              return [];
            const rect = element.getBoundingClientRect();
            return rect.width > 0 &&
              rect.height > 0 &&
              rect.left + scrollX < crop.x + crop.width &&
              rect.right + scrollX > crop.x &&
              rect.top + scrollY < crop.y + crop.height &&
              rect.bottom + scrollY > crop.y
              ? [element.className]
              : [];
          },
        );
      }, clip);
      expect(
        overlappingOverlays,
        "overlays intersecting the exported crop",
      ).toEqual([]);
      await page.screenshot({ path: screenshotPath("closed"), fullPage: true });
      // Locator.screenshot() scrolls a tall list into view and can place sticky
      // UI over it. A document-coordinate clip preserves the initial state.
      await page.screenshot({
        path: screenshotPath("priorities"),
        fullPage: true,
        clip,
      });
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
      await expect(skip).not.toBeFocused();
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
