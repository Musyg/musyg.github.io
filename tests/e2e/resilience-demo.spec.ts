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
      }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          `/demos/agent-resilience/?lang=${locale}&scenario=${scenario.id}`,
        );
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(
          page.locator(`[data-scenario="${scenario.id}"]`),
        ).toHaveAttribute("aria-pressed", "true");
        if (locale === "fr" && (width === 1440 || width === 390)) {
          await page.screenshot({
            path: testInfo.outputPath(
              `resilience-${scenario.id}-${width}-initial.png`,
            ),
            fullPage: true,
          });
        }
        for (const [index, state] of scenario.states.entries()) {
          if (index) await page.locator("#next").click();
          await expect(page.locator("#state")).toHaveText(state);
          await expect(page.locator("#step")).toHaveText(
            new RegExp(
              `^(Step|Étape) ${index + 1}/${scenario.states.length}.*\\d+[.,]\\d{3} ms$`,
            ),
          );
          await expect(page.locator("#step")).toHaveAttribute(
            "title",
            /depuis le début de l’exécution|since execution started/,
          );
          await expect(
            page.locator('#timeline [aria-current="step"]'),
          ).toHaveAttribute("data-step", String(index));
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
          new RegExp(`/blob/[a-f0-9]{40}/agent_resilience/${scenario.source}$`),
        );
        await expect(page.locator("#next")).toBeDisabled();
        if (locale === "fr" && (width === 1440 || width === 390)) {
          await page.screenshot({
            path: testInfo.outputPath(
              `resilience-${scenario.id}-${width}-final.png`,
            ),
            fullPage: true,
          });
        }
        await page.locator("#previous").click();
        await expect(page.locator("#state")).toHaveText(
          scenario.states.at(-2)!,
        );
        await page.locator('#timeline button[data-step="0"]').click();
        await expect(page.locator("#previous")).toBeDisabled();
        await expect(page.locator("#outcome-summary")).not.toBeEmpty();
        await expect(page.locator("#journey")).not.toBeEmpty();
        await expect(page.locator("#back-to-project")).toHaveAttribute(
          "href",
          locale === "fr"
            ? "/fr/realisations/agent-resilience/"
            : "/work/agent-resilience/",
        );
        await page.locator("#speed").selectOption("2");
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
  test(`resilience share, trace and history ${locale}`, async ({ page }) => {
    await page.goto(
      `/demos/agent-resilience/?lang=${locale}&scenario=dlq&step=5&ref=portfolio#trace`,
    );
    await expect(page.locator("#state")).toHaveText("DLQ");
    await expect(page.locator("#step")).toContainText("5/9");
    await page.locator("#next").click();
    await page.locator("#language").click();
    await expect(page).toHaveURL(
      new RegExp(`lang=${locale === "fr" ? "en" : "fr"}`),
    );
    const shared = new URL(page.url());
    expect(shared.searchParams.get("step")).toBe("6");
    expect(shared.searchParams.get("ref")).toBe("portfolio");
    expect(shared.hash).toBe("#trace");
    await page.reload();
    await expect(page.locator("#step")).toContainText("6/9");
    await page.locator('[data-scenario="mqtt"]').click();
    await page.goBack();
    await expect(page.locator("#step")).toContainText("6/9");
    await expect(page.locator('[data-scenario="dlq"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.goForward();
    await expect(page.locator("#state")).toHaveText("OFFLINE");
    await page
      .locator("details")
      .filter({ has: page.locator("#rows") })
      .locator(":scope > summary")
      .click();
    await page.locator('#rows button[data-step="8"]').click();
    await expect(page.locator("#step")).toContainText("9/9");
    await expect(
      page.locator('#timeline [aria-current="step"]'),
    ).toHaveAttribute("data-step", "8");
    const keyboardStep = page.locator('#timeline button[data-step="2"]');
    await keyboardStep.focus();
    await keyboardStep.press("Enter");
    await expect(page.locator("#step")).toContainText("3/9");
    await expect(page.locator('#timeline button[data-step="2"]')).toBeFocused();
  });
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
