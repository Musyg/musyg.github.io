import { expect, test } from "@playwright/test";

for (const locale of ["en", "fr"] as const) {
  test(`project presentations remain independent in ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    const prefix = locale === "fr" ? "/fr/realisations" : "/work";
    for (const slug of [
      "inaricom",
      "mikasshop",
      "pedi-sense",
      "agent-resilience",
      "persistent-memory",
    ]) {
      await page.goto(`${prefix}/${slug}/`);
      await expect(page.locator("main")).not.toContainText(/Talos|Herm[eè]s/i);
      await expect(page.locator("a[href*='talos']")).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://musyg.com${prefix}/${slug}/`,
      );
    }
    await page.goto(`${prefix}/talos-memory/`);
    await expect(page).toHaveURL(
      `http://127.0.0.1:4173${prefix}/persistent-memory/`,
    );
    await expect(page.locator("h1")).toHaveText("Persistent Memory");
    await expect(page.locator("main")).not.toContainText(/Talos|Herm[eè]s/i);
  });
}
