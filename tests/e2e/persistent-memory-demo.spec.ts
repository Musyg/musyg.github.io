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
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: undefined,
        });
      });
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(
        `/demos/persistent-memory/?lang=${locale}&campaign=portfolio#proof`,
      );
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("#previous")).toBeDisabled();
      await expect(page.locator("[data-step]")).toHaveCount(5);
      for (const [index, event] of trace.events.entries()) {
        if (index) await page.locator("#next").click();
        await expect(page.locator("#status")).toHaveAttribute(
          "data-phase",
          event.phase,
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
        const observations = JSON.parse(
          (await page.locator("#machine").textContent())!,
        );
        expect(observations.reads[roles[index]]).toEqual(read);
        await expect(page.locator("#node-language")).toHaveAttribute(
          "data-state",
          "available",
        );
        await expect(page.locator("#node-date")).toHaveAttribute(
          "data-state",
          index < 3 ? "available" : "blocked",
        );
        await expect(page.locator("#node-brief")).toHaveAttribute(
          "data-state",
          index === 0 ? "absent" : index < 3 ? "available" : "blocked",
        );
        for (const source of ["date", "language"]) {
          await expect(page.locator(`#edge-${source}`)).toHaveAttribute(
            "data-linked",
            String(index !== 0),
          );
        }
        if (index === 2) {
          expect(observations.reads.old_brief_before_replacement).toEqual(
            event.reads.old_brief_before_replacement,
          );
          await expect(page.locator("#change-before")).toContainText(
            locale === "fr" ? "vendredi" : "Friday",
          );
          await expect(page.locator("#change-after")).toContainText(
            locale === "fr" ? "lundi" : "Monday",
          );
          await expect(page.locator("#change-after")).toContainText(
            locale === "fr" ? "avant remplacement" : "before replacement",
          );
        }
        if (index === 4) {
          expect(observations.details.retained_current_authority).toBe(true);
          await expect(page.locator("#restore-authority")).toBeVisible();
          await expect(page.locator("#restore-authority")).toContainText(
            locale === "fr"
              ? /autorité actuelle.*séparément/i
              : /current authority.*separately/i,
          );
        } else {
          await expect(page.locator("#restore-authority")).not.toBeVisible();
        }
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
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "revoke",
      );
      await page.locator('[data-step="2"]').focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "correct",
      );
      await expect(page.locator('[data-step="2"]')).toBeFocused();
      await page.locator("#language").click();
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        locale === "fr" ? "en" : "fr",
      );
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "correct",
      );
      await page.locator("#language").click();
      await expect(page.locator("#back")).toHaveAttribute(
        "href",
        locale === "fr"
          ? "/fr/realisations/persistent-memory/"
          : "/work/persistent-memory/",
      );
      await page.locator("#node-language").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#node-language")).toBeFocused();
      await expect(page.locator("details.technical")).toHaveCount(1);
      await expect(page.locator("#machine")).toBeVisible();
      expect(
        JSON.parse((await page.locator("#inspector-read").textContent())!).read,
      ).toEqual(trace.events[2].reads.control);
      await page.locator("#node-brief").click();
      expect(
        JSON.parse((await page.locator("#inspector-read").textContent())!).read,
      ).toEqual(trace.events[2].reads.brief_v2);
      await page.locator("#technical > summary").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#machine")).not.toBeVisible();
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
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "admit",
      );
      await expect(page.locator("#previous")).toBeDisabled();
      await page.goto(
        `/demos/persistent-memory/?lang=${locale}&step=3&campaign=portfolio#proof`,
      );
      await page.reload();
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "correct",
      );
      await page.locator("#next").click();
      await page.locator("#language").click();
      await page.goBack();
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "revoke",
      );
      await page.goBack();
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "correct",
      );
      await page.goForward();
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "revoke",
      );
      const shared = new URL(page.url());
      expect(shared.searchParams.get("step")).toBe("4");
      expect(shared.searchParams.get("lang")).toBe(locale);
      expect(shared.searchParams.get("campaign")).toBe("portfolio");
      expect(shared.hash).toBe("#proof");
      await page.locator("#share").click();
      await expect(page.locator("#share-link")).toBeVisible();
      await expect(page.locator("#share-link")).toHaveValue(shared.href);
      await expect(page.locator("#share-link")).toBeFocused();
      await expect(page.locator("#share-status")).not.toHaveText("");
      await page.goto(
        "/demos/persistent-memory/?lang=invalid&step=99&campaign=portfolio#proof",
      );
      await expect(page.locator("html")).toHaveAttribute("lang", "fr");
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "admit",
      );
      expect(errors).toEqual([]);
      expect(externalRequests).toEqual([]);
    });
  }
}
