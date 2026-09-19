import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const locale of ["en", "fr"] as const) {
  const path =
    locale === "fr" ? "/fr/realisations/bifrost-vpn/" : "/work/bifrost-vpn/";
  test(`Bifrost ${locale} stays a software MVP with readable links and layout`, async ({
    page,
  }) => {
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(
        page.getByRole("heading", { level: 1, name: "Bifrost", exact: true }),
      ).toBeVisible();
      await expect(page.locator(".case-hero .metadata-rail")).toContainText(
        locale === "fr"
          ? "MVP public, en développement"
          : "Public MVP, in development",
      );
      await expect(
        page.locator(
          '.case-actions a[href="https://github.com/Musyg/bifrost-vpn"]',
        ),
      ).toBeVisible();
      await expect(page.locator("main")).toContainText("WireGuard");
      await expect(page.locator("main")).toContainText("nftables");
      await expect(page.locator(".case-hero")).not.toContainText(
        /Project started|Début du projet/,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    const work = locale === "fr" ? "/fr/realisations/" : "/work/";
    await page.goto(`${work}?filter=software`);
    await expect(
      page.locator(".project-card").filter({
        has: page.getByRole("heading", { name: "Bifrost", exact: true }),
      }),
    ).toBeVisible();
    await page.goto(`${work}?filter=security`);
    await expect(
      page.locator(".project-card").filter({
        has: page.getByRole("heading", { name: "Bifrost", exact: true }),
      }),
    ).toHaveCount(0);
    await page.goto(locale === "fr" ? "/fr/ingenierie/" : "/engineering/");
    await expect(
      page.getByRole("heading", { name: "Bifrost", exact: true }),
    ).toBeVisible();
  });

  test(`@a11y Bifrost ${locale} case study`, async ({ page }) => {
    await page.goto(path);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}
