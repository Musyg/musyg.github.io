import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const scenarios = [
  {
    id: "circuit",
    states: [
      "CLOSED",
      "CLOSED",
      "CLOSED",
      "CLOSED",
      "OPEN",
      "OPEN",
      "OPEN",
      "OPEN",
      "HALF_OPEN",
      "CLOSED",
      "CLOSED",
    ],
    metrics: ["8", "6", "2"],
    source: "circuit_breaker.py",
  },
  {
    id: "dlq",
    states: [
      "QUEUED",
      "PROCESSING",
      "QUEUED",
      "PROCESSING",
      "DLQ",
      "DLQ",
      "QUEUED",
      "PROCESSING",
      "COMPLETED",
    ],
    metrics: ["0", "0", "0"],
    source: "dlq.py",
  },
  {
    id: "mqtt",
    states: [
      "OFFLINE",
      "BUFFERED",
      "BUFFERED",
      "BUFFERED",
      "CONNECTED",
      "CONNECTED",
      "CONNECTED",
      "CONNECTED",
      "CONNECTED",
    ],
    metrics: ["0", "3", "3"],
    source: "mqtt_buffer.py",
  },
];

for (const locale of ["en", "fr"]) {
  for (const width of [1440, 390, 320]) {
    for (const scenario of scenarios) {
      test(`resilience ${scenario.id} ${locale} at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/demos/agent-resilience/?lang=${locale}&scenario=${scenario.id}`,
        );
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(
          page.locator(`[data-scenario="${scenario.id}"]`),
        ).toHaveAttribute("aria-pressed", "true");
        for (const [index, state] of scenario.states.entries()) {
          if (index) await page.locator("#next").click();
          await expect(page.locator("#state")).toHaveText(state);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
        }
        for (const [index, id] of ["attempts", "calls", "blocked"].entries()) {
          await expect(page.locator(`#${id}`)).toHaveText(
            scenario.metrics[index],
          );
        }
        await expect(page.locator("#source")).toHaveAttribute(
          "href",
          new RegExp(`${scenario.source}$`),
        );
        await expect(page.locator("#next")).toBeDisabled();
        await page.locator("#restart").click();
        await expect(page.locator("#state")).toHaveText(scenario.states[0]);
        await page.locator("#language").click();
        await expect(page.locator("html")).toHaveAttribute(
          "lang",
          locale === "fr" ? "en" : "fr",
        );
        await page.locator("#play").click();
        const other = scenario.id === "dlq" ? "mqtt" : "dlq";
        await page.locator(`[data-scenario="${other}"]`).click();
        await expect(page.locator("#play")).toHaveText(
          locale === "fr" ? "Play demo" : "Lire la démo",
        );
        await expect(page.locator("#state")).toHaveText(
          other === "dlq" ? "QUEUED" : "OFFLINE",
        );
      });
    }
  }
  for (const scenario of scenarios) {
    test(`resilience ${scenario.id} ${locale} @a11y`, async ({ page }) => {
      await page.goto(
        `/demos/agent-resilience/?lang=${locale}&scenario=${scenario.id}`,
      );
      const scan = await new AxeBuilder({ page }).analyze();
      expect(scan.violations).toEqual([]);
    });
  }
}
