import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { professionalProfiles } from "../../src/content/site";

for (const path of [
  "/contact/",
  "/fr/contact/",
  "/security-research/",
  "/fr/recherche-securite/",
]) {
  test(`platform logos preserve profile links and spacing on ${path}`, async ({
    page,
  }) => {
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const profiles = path.includes("contact")
        ? professionalProfiles
        : professionalProfiles.filter((p) => p.platform !== "github");
      await expect(page.locator(".profile-list > a")).toHaveCount(
        profiles.length,
      );
      await expect(page.locator(".site-footer .platform-logo")).toHaveCount(5);
      for (const profile of profiles) {
        const link = page.locator(`.profile-list a[href="${profile.url}"]`);
        await expect(link).toContainText(profile.name);
        await expect(link).toContainText(profile.handle);
        const logo = link.locator(".platform-logo");
        await expect(logo).toHaveAttribute("alt", "");
        await expect(logo).toHaveAttribute("aria-hidden", "true");
        await expect(logo).toHaveAttribute("src", /^\/platforms\//);
        await expect
          .poll(() =>
            logo.evaluate(
              (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
            ),
          )
          .toBe(true);
        const iconBox = await logo.boundingBox();
        const nameBox = await link.locator("strong").boundingBox();
        expect(
          nameBox!.x - (iconBox!.x + iconBox!.width),
        ).toBeGreaterThanOrEqual(13);
        await link.focus();
        await expect(link).toBeFocused();
        expect(
          await link.evaluate((el) => getComputedStyle(el).boxShadow),
        ).toContain("rgb(0, 94, 255)");
      }
      for (const logo of await page
        .locator(".site-footer .platform-logo")
        .all()) {
        await expect
          .poll(() =>
            logo.evaluate(
              (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
            ),
          )
          .toBe(true);
      }
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
    }
  });
}

test("@a11y platform links remain named without duplicate logo announcements", async ({
  page,
}) => {
  await page.goto("/fr/contact/");
  const result = await new AxeBuilder({ page })
    .include(".contact-profiles")
    .include(".site-footer")
    .analyze();
  expect(result.violations).toEqual([]);
});
