import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { publicRoutes, contactPath } from "../../src/routes";
import { engagements } from "../../src/content/engagements";

for (const route of publicRoutes.filter((route) => route.kind === "practice")) {
  test(`worldwide offer is readable and linked on ${route.path}`, async ({
    page,
  }) => {
    const copy = engagements[route.practice!][route.locale];
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route.path);
      const section = page.locator(".engagement-section");
      await expect(
        section.getByRole("heading", { name: copy.title, exact: true }),
      ).toBeVisible();
      await expect(section.locator("li")).toHaveCount(3);
      await expect(
        section.getByRole("link", { name: copy.action, exact: true }),
      ).toHaveAttribute("href", contactPath(route.locale));
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const boxes = await section.locator(":scope > div").evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        }),
      );
      expect(
        boxes[0].right <= boxes[1].left || boxes[0].bottom <= boxes[1].top,
      ).toBe(true);
    }
  });

  test(`@a11y worldwide offer on ${route.path}`, async ({ page }) => {
    await page.goto(route.path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
