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
      const logo = page.locator(".case-brand-image");
      await expect(logo).toBeVisible();
      await expect(logo).toHaveAttribute(
        "src",
        "/brands/bifrost/bifrost-fond-sombre.png",
      );
      await expect(logo).toHaveJSProperty("naturalWidth", 1448);
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
    await expect(page.locator(".project-brand-image")).toHaveCount(1);
    await expect(
      page.locator(".project-card").filter({
        has: page.getByRole("heading", { name: "Bifrost", exact: true }),
      }),
    ).toBeVisible();
    await page.goto(`${work}?filter=security`);
    await expect(page.locator(".project-brand-image")).toHaveCount(0);
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

  test(`Bifrost ${locale} is discoverable from home and software engineering`, async ({
    page,
  }, testInfo) => {
    const entries =
      locale === "fr" ? ["/fr/", "/fr/ingenierie/"] : ["/", "/engineering/"];
    for (const entry of entries) {
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(entry);
        const spotlight = page.getByRole("region", { name: /Bifrost,/ });
        await spotlight.scrollIntoViewIfNeeded();
        await expect(spotlight).toBeVisible();
        await expect(spotlight).toContainText(
          locale === "fr"
            ? "MVP public, en développement"
            : "Public MVP, in development",
        );
        await expect(spotlight.locator("img")).toHaveJSProperty(
          "naturalWidth",
          1448,
        );
        await expect(
          spotlight.getByRole("link", {
            name: locale === "fr" ? "Explorer le code" : "Browse the code",
          }),
        ).toHaveAttribute("href", "https://github.com/Musyg/bifrost-vpn");
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        if (entry === entries[0]) {
          await spotlight.screenshot({
            path: testInfo.outputPath(`bifrost-spotlight-${width}.png`),
          });
        }
        await spotlight
          .getByRole("link", {
            name: locale === "fr" ? "Découvrir Bifrost" : "Explore Bifrost",
          })
          .click();
        await expect(page).toHaveURL(new RegExp(path));
        await expect(
          page.getByRole("heading", { level: 1, name: "Bifrost", exact: true }),
        ).toBeVisible();
      }
    }
  });

  test(`@a11y Bifrost ${locale} spotlight`, async ({ page }) => {
    for (const entry of locale === "fr"
      ? ["/fr/", "/fr/ingenierie/"]
      : ["/", "/engineering/"]) {
      await page.goto(entry);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
  });
}
