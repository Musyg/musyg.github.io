import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const trace = JSON.parse(
  readFileSync("public/demos/persistent-memory/trace.json", "utf8"),
);
const roles = ["date_v1", "brief_v1", "brief_v2", "brief_v2", "control"];

for (const locale of ["en", "fr"]) {
  for (const width of [1440, 390, 320]) {
    test(`persistent memory ${locale} at ${width}px`, async ({
      page,
    }, testInfo) => {
      const externalRequests: string[] = [];
      const errors: string[] = [];
      page.on("request", (request) => {
        if (
          !new URL(request.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/)
        ) {
          externalRequests.push(request.url());
        }
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/demos/persistent-memory/?lang=${locale}`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("#previous")).toBeDisabled();
      await expect(page.locator("[data-step]")).toHaveCount(5);
      for (const [index, event] of trace.events.entries()) {
        if (index) await page.locator("#next").click();
        await expect(page.locator("#status")).toHaveText(
          event.phase.toUpperCase(),
        );
        await expect(page.locator(`[data-step="${index}"]`)).toHaveAttribute(
          "aria-current",
          "step",
        );
        const read = event.reads[roles[index]];
        await expect(page.locator("#answer")).toHaveText(
          read.allowed
            ? read.content
            : locale === "fr"
              ? "Aucune preuve admissible"
              : "No admissible evidence",
        );
        await expect(page.locator("#answer-meta")).toContainText(read.reason);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
      await expect(page.locator("#next")).toBeDisabled();
      await expect(
        page.locator('[data-role="quarantined_control"]'),
      ).toContainText("authority_or_store_unavailable");
      await page.locator("#previous").click();
      await expect(page.locator("#status")).toHaveText("REVOKE");
      await page.locator('[data-step="2"]').focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#status")).toHaveText("CORRECT");
      await expect(page.locator('[data-step="2"]')).toBeFocused();
      await page.locator("#language").click();
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        locale === "fr" ? "en" : "fr",
      );
      await expect(page.locator("#status")).toHaveText("CORRECT");
      await page.locator("#language").click();
      await expect(page.locator("#back")).toHaveAttribute(
        "href",
        locale === "fr"
          ? "/fr/realisations/persistent-memory/"
          : "/work/persistent-memory/",
      );
      await page.locator("summary").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#machine")).toBeVisible();
      expect(
        JSON.parse((await page.locator("#machine").textContent())!),
      ).toEqual({
        operations: trace.events[2].operations,
        reads: trace.events[2].reads,
        details: trace.events[2].details,
      });
      await page.keyboard.press("Enter");
      await expect(page.locator("#machine")).not.toBeVisible();
      if (width !== 390) {
        const scan = await new AxeBuilder({ page }).analyze();
        expect(scan.violations).toEqual([]);
      }
      const screenshotName = `demo-${locale}-${width}.png`;
      const screenshotDirectory = process.env.DEMO_SCREENSHOT_DIR;
      if (screenshotDirectory)
        mkdirSync(screenshotDirectory, { recursive: true });
      await page.screenshot({
        path: screenshotDirectory
          ? join(screenshotDirectory, screenshotName)
          : testInfo.outputPath(screenshotName),
        fullPage: true,
      });
      await page.locator("#restart").click();
      await expect(page.locator("#status")).toHaveText("ADMIT");
      await expect(page.locator("#previous")).toBeDisabled();
      expect(errors).toEqual([]);
      expect(externalRequests).toEqual([]);
    });
  }
}
