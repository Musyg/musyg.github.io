import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const locale of ["en", "fr"]) {
  for (const width of [1440, 390, 320]) {
    test(`resilience replay ${locale} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/demos/agent-resilience/?lang=${locale}`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("#state")).toHaveText("CLOSED");
      for (let step = 0; step < 4; step++) await page.locator("#next").click();
      await expect(page.locator("#state")).toHaveText("OPEN");
      await expect(page.locator("#calls")).toHaveText("4");
      for (let step = 0; step < 2; step++) await page.locator("#next").click();
      await expect(page.locator("#calls")).toHaveText("4");
      await expect(page.locator("#blocked")).toHaveText("2");
      for (let step = 0; step < 2; step++) await page.locator("#next").click();
      await expect(page.locator("#state")).toHaveText("HALF_OPEN");
      for (let step = 0; step < 2; step++) await page.locator("#next").click();
      await expect(page.locator("#state")).toHaveText("CLOSED");
      await expect(page.locator("#calls")).toHaveText("6");
      await expect(page.locator("#attempts")).toHaveText("8");
      await expect(page.locator("#next")).toBeDisabled();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.locator("#restart").click();
      await expect(page.locator("#attempts")).toHaveText("0");
      await page.locator("#language").click();
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        locale === "fr" ? "en" : "fr",
      );
    });
  }
  test(`resilience replay ${locale} @a11y`, async ({ page }) => {
    await page.goto(`/demos/agent-resilience/?lang=${locale}`);
    const scan = await new AxeBuilder({ page }).analyze();
    expect(scan.violations).toEqual([]);
  });
}
