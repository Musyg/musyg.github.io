import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ipiArticle } from "../../src/content/ipi-article";

for (const locale of ["en", "fr"] as const) {
  const home = locale === "fr" ? "/fr/" : "/";
  const casePath =
    locale === "fr"
      ? "/fr/realisations/security-reviews/"
      : "/work/security-reviews/";

  test(`cybersecurity homepage and profile navigation remain clear in ${locale}`, async ({
    page,
  }) => {
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(home);
      const card = page.locator(".project-card").filter({
        has: page.getByRole("heading", {
          name: "Security Reviews",
          exact: true,
        }),
      });
      await expect(card).toContainText("Web / API");
      await expect(card).toContainText("LLM / agents");
      const feature = page.locator('[aria-labelledby="home-ipi-title"]');
      await expect(feature.getByRole("heading", { level: 2 })).toHaveText(
        ipiArticle[locale].title,
      );
      await expect(
        feature.locator(`a[href="${ipiArticle[locale].path}"]`),
      ).toHaveCount(1);
      await expect(page.locator("main .profile-list")).toHaveCount(0);
      await feature.locator(`a[href="${casePath}"]`).click();
      await expect(page).toHaveURL(new RegExp(casePath));
      const profileJump = page.locator(
        '.case-actions a[href="#security-profiles-title"]',
      );
      await expect(
        page.locator('.case-actions a[href="https://hackerone.com/gilmu"]'),
      ).toHaveCount(0);
      await profileJump.click();
      await expect(page.locator("#security-profiles-title")).toBeInViewport();
      await expect(page.locator(".profile-list > a")).toHaveCount(4);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.goto(home);
      await page
        .locator('[aria-labelledby="home-ipi-title"] a.button-primary')
        .click();
      await expect(page).toHaveURL(new RegExp(ipiArticle[locale].path));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        ipiArticle[locale].title,
      );
    }
  });

  test(`@a11y balanced cybersecurity presentation in ${locale}`, async ({
    page,
  }) => {
    for (const path of [home, casePath]) {
      await page.goto(path);
      const scan = new AxeBuilder({ page }).withTags([
        "wcag2a",
        "wcag2aa",
        "wcag21aa",
      ]);
      const result = await scan.analyze();
      expect(result.violations).toEqual([]);
      const ids = await page
        .locator("[id]")
        .evaluateAll((elements) => elements.map((el) => el.id));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
}
