import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const projects = ["inaricom", "mikasshop", "pedi-sense"] as const;

for (const locale of ["en", "fr"] as const) {
  test(`commerce agent presentations are readable and project-specific in ${locale}`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const project of projects) {
      const prefix = locale === "fr" ? "/fr/realisations" : "/work";
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${prefix}/${project}/`);
        const overview = page.locator(
          project === "mikasshop"
            ? ".mika-overview"
            : project === "pedi-sense"
              ? ".pedi-overview"
              : ".inaricom-overview",
        );
        const cards = overview.locator(
          ".mika-system-nodes > li, .pedi-system-nodes > li",
        );
        await expect(cards).toHaveCount(project === "inaricom" ? 6 : 4);
        await expect(overview).toContainText("Analytics Hub");
        await expect(overview).not.toContainText(
          /Talos|multi-boutiques|multi-store|shared infrastructure|composants partagés/i,
        );
        const architecture = page.locator(".case-body");
        for (const term of ["FAISS", "Qdrant", "MQTT", "KPI"])
          await expect(architecture).toContainText(term);
        if (project === "inaricom") {
          await expect(cards.nth(2)).toContainText(
            locale === "fr" ? "Conclusion des ventes" : "Closing",
          );
          await expect(cards.nth(3)).toContainText(
            locale === "fr"
              ? "Facturation et commandes"
              : "Invoicing and orders",
          );
          await expect(cards.nth(3)).toContainText("PDF");
          await expect(cards.nth(1)).toContainText(
            locale === "fr" ? "qualification" : "qualification",
          );
          await expect(overview).toContainText(
            locale === "fr" ? "en cours d’intégration" : "being integrated",
          );
        } else await expect(architecture).toContainText("skills");
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBeTruthy();
        const layout = await cards.evaluateAll((elements) =>
          elements.map((element) => {
            const heading = element.querySelector("h3, h4")!;
            const number = element.querySelector("span")!;
            const rect = element.getBoundingClientRect();
            return {
              width: rect.width,
              numberGap:
                heading.getBoundingClientRect().top -
                number.getBoundingClientRect().bottom,
              color: getComputedStyle(element).borderTopColor,
              headingSize: parseFloat(getComputedStyle(heading).fontSize),
            };
          }),
        );
        for (const card of layout) {
          expect(card.width).toBeLessThanOrEqual(width);
          expect(card.numberGap).toBeGreaterThanOrEqual(20);
          expect(card.headingSize).toBeLessThanOrEqual(22);
          expect(card.color).toBe("rgb(0, 94, 255)");
        }
        if (width === 1440 || width === 390) {
          const system =
            project === "mikasshop"
              ? page.locator(".mika-system")
              : project === "pedi-sense"
                ? page.locator(".pedi-system")
                : overview;
          await system.screenshot({
            path: testInfo.outputPath(`${project}-${locale}-${width}.png`),
          });
        }
      }
    }
    await page.goto(locale === "fr" ? "/fr/systemes-ia/" : "/ai-systems/");
    await expect(
      page
        .locator(
          `.project-card a[href="${locale === "fr" ? "/fr/realisations" : "/work"}/inaricom/"]`,
        )
        .first(),
    ).toBeVisible();
  });

  test(`commerce agents accessibility ${locale} @a11y`, async ({ page }) => {
    for (const project of projects) {
      await page.goto(
        `${locale === "fr" ? "/fr/realisations" : "/work"}/${project}/`,
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  });
}
