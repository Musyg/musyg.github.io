import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { publicRoutes } from "../../src/routes";

test("case-study evidence is available in the hero in both languages", async ({
  page,
}) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const locale of ["en", "fr"]) {
      for (const slug of [
        "celo-credentials",
        "security-reviews",
        "agent-resilience",
        "inaricom",
        "mikasshop",
        "pedi-sense",
      ]) {
        await page.goto(
          `${locale === "fr" ? "/fr/realisations" : "/work"}/${slug}/`,
        );
        const actions = page.locator(".case-hero .case-actions");
        const heroLinks = actions.locator("a");
        await expect(heroLinks).toHaveCount(2);
        for (const link of await heroLinks.all()) {
          await expect(link).toBeVisible();
          const bounds = await link.boundingBox();
          expect(bounds?.x).toBeGreaterThanOrEqual(0);
          expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
          expect(bounds!.height).toBeGreaterThanOrEqual(44);
        }
        const hrefs = await heroLinks.evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("href")),
        );
        expect(
          await page
            .locator(".case-body .evidence-links a")
            .evaluateAll((nodes) =>
              nodes.map((node) => node.getAttribute("href")),
            ),
        ).toEqual(hrefs);
        if (["inaricom", "mikasshop", "pedi-sense"].includes(slug)) {
          expect(hrefs).toContain(
            `https://github.com/Musyg/Musyg/blob/main/case-studies/${locale}/${slug}.md`,
          );
        }
        expect(
          await actions.evaluate(
            (element) =>
              element.getBoundingClientRect().bottom <
              document.querySelector(".case-layout")!.getBoundingClientRect()
                .top,
          ),
        ).toBe(true);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
    }
  }
});

test("AI evidence links expose the named public resources and localized guide", async ({
  page,
}) => {
  for (const [route, locale] of [
    ["/ai-systems/", "en"],
    ["/fr/systemes-ia/", "fr"],
  ]) {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(route);
    const evidence = page.locator(".evidence-list");
    await expect(evidence.locator("a")).toHaveCount(5);
    for (const repository of [
      "agent-resilience",
      "production-agent-template",
      "ai-adoption-playbook",
      "talos",
    ]) {
      await expect(
        evidence.locator(`a[href="https://github.com/Musyg/${repository}"]`),
      ).toBeVisible();
    }
    await expect(evidence.getByRole("link", { name: /Talos/ })).toContainText(
      locale === "fr"
        ? "l’implémentation reste privée"
        : "implementation remains private",
    );
    await expect(
      evidence.getByRole("link", { name: /interacti/ }),
    ).toHaveAttribute(
      "href",
      `https://musyg.github.io/ai-adoption-playbook/${locale === "fr" ? "fr/" : ""}`,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

for (const route of ["/fr/systemes-ia/", "/fr/realisations/mikasshop/"]) {
  test(`@a11y public evidence access ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(route);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

for (const route of publicRoutes) {
  test(`prerendered route ${route.path}`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", route.locale);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new URL(route.path, "https://musyg.com").toString(),
    );
  });
}

test("language switch keeps the matching page context", async ({ page }) => {
  await page.goto("/work/celo-credentials/");
  await page.getByRole("link", { name: "View this page in French" }).click();
  await expect(page).toHaveURL(/\/fr\/realisations\/celo-credentials\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

test("work filters are reflected in the URL and the visible cards", async ({
  page,
}) => {
  await page.goto("/work/");
  await page.getByRole("button", { name: "AI systems" }).click();
  await expect(page).toHaveURL(/filter=ai/);
  await expect(
    page.getByRole("button", { name: /AI systems/, pressed: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", { name: "Agent Resilience" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "MikasShop" })).toHaveCount(0);
});

test("mobile menu opens, closes with Escape, and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#mobile-navigation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-navigation")).toBeHidden();
  await expect(menu).toBeFocused();
});

test("favicon and social-preview metadata are wired", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/favicon.svg",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://musyg.com/social-preview.png",
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
    "content",
    "1200",
  );
  await expect(
    page.locator('meta[property="og:image:height"]'),
  ).toHaveAttribute("content", "630");
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    "content",
    /Gilles Musy portfolio/,
  );
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
    "content",
    /Gilles Musy portfolio/,
  );
});

test("the approved compact mark preserves the semantic header wordmark", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const wordmark = page.getByRole("link", { name: "Gilles Musy, home" });
  const mark = wordmark.locator(".header-mark");
  await expect(wordmark).toContainText("Gilles Musy");
  await expect(mark).toHaveAttribute("src", "/header-mark.svg");
  await expect(mark).toHaveJSProperty("complete", true);
  await expect(mark).toHaveCSS("width", "28px");
  await expect(mark).toHaveCSS("height", "28px");

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(mark).toHaveCSS("width", "26px");
  await expect(mark).toHaveCSS("height", "26px");

  await page.setViewportSize({ width: 320, height: 700 });
  await expect(mark).toHaveCSS("width", "26px");
  await expect(mark).toHaveCSS("height", "26px");
  await expect(page.locator("body")).toHaveCSS("min-width", "0px");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
});

test("the bounded hero refinement preserves hierarchy and responsive actions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const title = page.locator("#hero-title");
  const titleLines = title.locator("span");
  const primary = page.getByRole("link", { name: "View work" });
  const secondary = page.getByRole("link", { name: "Explore expertise" });

  await expect(titleLines).toHaveCount(3);
  await expect(title).toHaveCSS("font-size", "61.2px");
  await expect(page.locator(".hero-trace-desktop")).toBeVisible();
  await expect(page.locator(".hero-trace-mobile")).toBeHidden();
  await expect(primary).toHaveCSS("background-color", "rgba(0, 94, 255, 0.86)");
  await expect(primary).toHaveCSS("border-color", "rgb(0, 94, 255)");
  await expect(secondary).toHaveCSS(
    "background-color",
    "rgba(21, 26, 33, 0.72)",
  );
  await expect(secondary).toHaveCSS("border-color", "rgb(102, 125, 141)");

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(title).toHaveCSS("font-size", "35.1px");
  await expect(page.locator(".hero-trace-desktop")).toBeHidden();
  await expect(page.locator(".hero-trace-mobile")).toBeVisible();
  for (const action of [primary, secondary]) {
    expect(
      await action.evaluate(
        (element) =>
          element.scrollWidth <= element.clientWidth &&
          element.scrollHeight <= element.clientHeight,
      ),
    ).toBe(true);
  }

  await page.goto("/fr/");
  const frenchTitle = page.locator("#hero-title");
  const frenchLines = frenchTitle.locator("span");
  const frenchPrimary = page.getByRole("link", {
    name: "Voir les réalisations",
  });
  const frenchSecondary = page.getByRole("link", {
    name: "Explorer les expertises",
  });
  await expect(frenchLines).toHaveCount(3);
  await expect(frenchTitle).toHaveCSS("font-size", "35.1px");
  for (const line of await frenchLines.all()) {
    expect(
      await line.evaluate((element) => {
        const styles = getComputedStyle(element);
        return (
          element.getBoundingClientRect().height <=
          Number.parseFloat(styles.lineHeight) + 1
        );
      }),
    ).toBe(true);
  }
  for (const action of [frenchPrimary, frenchSecondary]) {
    expect(
      await action.evaluate(
        (element) =>
          element.scrollWidth <= element.clientWidth &&
          element.scrollHeight <= element.clientHeight,
      ),
    ).toBe(true);
  }

  await page.setViewportSize({ width: 320, height: 700 });
  await expect(frenchTitle).toHaveCSS("font-size", "28.8px");
  for (const line of await frenchLines.all()) {
    expect(
      await line.evaluate((element) => {
        const styles = getComputedStyle(element);
        return (
          element.getBoundingClientRect().height <=
          Number.parseFloat(styles.lineHeight) + 1
        );
      }),
    ).toBe(true);
  }
  const primaryBox = await frenchPrimary.boundingBox();
  const secondaryBox = await frenchSecondary.boundingBox();
  expect(primaryBox).not.toBeNull();
  expect(secondaryBox).not.toBeNull();
  expect(secondaryBox!.y).toBeGreaterThan(primaryBox!.y + primaryBox!.height);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.locator(".hero-trace-mobile .hero-trace").first(),
  ).toBeHidden();
});

test("the review identity appears only on the bilingual Security Reviews case study", async ({
  page,
}) => {
  for (const path of [
    "/work/security-reviews/",
    "/fr/realisations/security-reviews/",
  ]) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    const mark = page.locator(".security-review-case-mark");
    await expect(mark).toHaveCount(1);
    await expect(mark).toBeVisible();
    await expect(mark).toHaveAttribute("src", "/security-review-mark.svg");
    await expect(mark).toHaveAttribute("alt", "");
    await expect(mark).toHaveAttribute("aria-hidden", "true");
    await expect(mark).toHaveJSProperty("complete", true);
    expect(await mark.evaluate((image) => image.naturalWidth)).toBe(48);
    await expect(mark).toHaveCSS("width", "48px");
    await expect(mark).toHaveCSS("height", "48px");

    await page.setViewportSize({ width: 320, height: 700 });
    await expect(mark).toHaveCSS("width", "34px");
    await expect(mark).toHaveCSS("height", "34px");
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
  }

  await page.goto("/work/celo-credentials/");
  await expect(page.locator(".security-review-case-mark")).toHaveCount(0);
  await page.goto("/work/");
  await expect(page.locator(".security-review-case-mark")).toHaveCount(0);
  await expect(page.locator(".header-mark")).toHaveAttribute(
    "src",
    "/header-mark.svg",
  );
});

test("the bilingual About renders the personal narrative", async ({ page }) => {
  for (const [path, introduction, ending] of [
    ["/fr/a-propos/", "Je suis Gilles Musy", "ce qui reste à explorer"],
    ["/about/", "I’m Gilles Musy", "what I’m still exploring"],
  ]) {
    await page.goto(path);
    await expect(page.locator(".page-lead")).toContainText(introduction);
    await expect(page.locator(".about-narrative p")).toHaveCount(5);
    await expect(page.locator(".about-narrative p").last()).toContainText(
      ending,
    );
  }
});

test("the bilingual About cards stay separated without a visible grid", async ({
  page,
}) => {
  const viewports = [
    { width: 1440, height: 900, margin: 96 },
    { width: 960, height: 800, margin: 67.2 },
    { width: 520, height: 800, margin: 48 },
    { width: 390, height: 844, margin: 48 },
    { width: 320, height: 700, margin: 48 },
  ];

  for (const path of ["/about/", "/fr/a-propos/"]) {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(path);
      const grid = page.locator(".principles-grid");
      const layout = await grid.evaluate((element) => {
        const articles = [...element.querySelectorAll(":scope > article")];
        const gridRect = element.getBoundingClientRect();
        const firstRect = articles[0].getBoundingClientRect();
        const lastRect = articles.at(-1)!.getBoundingClientRect();
        const style = getComputedStyle(element);

        return {
          articleCount: articles.length,
          background: style.backgroundColor,
          gap: Number.parseFloat(style.gap),
          marginTop: Number.parseFloat(style.marginTop),
          marginBottom: Number.parseFloat(style.marginBottom),
          paddingTop: Number.parseFloat(style.paddingTop),
          paddingBottom: Number.parseFloat(style.paddingBottom),
          topGap: firstRect.top - gridRect.top,
          bottomGap: gridRect.bottom - lastRect.bottom,
        };
      });

      expect(layout.articleCount).toBe(3);
      expect(layout.background).toBe("rgba(0, 0, 0, 0)");
      expect(layout.gap).toBe(18);
      expect(layout.marginTop).toBeCloseTo(viewport.margin, 0);
      expect(layout.marginBottom).toBeCloseTo(viewport.margin, 0);
      expect(layout.paddingTop).toBe(0);
      expect(layout.paddingBottom).toBe(0);
      expect(layout.topGap).toBeLessThanOrEqual(1.5);
      expect(layout.bottomGap).toBeLessThanOrEqual(1.5);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
    }
  }
});

test("section landmarks and detached cards retain the exact blue on desktop and mobile", async ({
  page,
}, testInfo) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/fr/", "/fr/a-propos/", "/fr/realisations/"]) {
      await page.goto(path);
      const cards = page.locator(
        ".project-card, .practice-card, .evidence-grid article, .principles-grid article",
      );
      const styles = await cards.evaluateAll((elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element);
          return { radius: style.borderRadius, border: style.borderTopColor };
        }),
      );
      expect(styles.length).toBeGreaterThan(0);
      for (const style of styles) {
        expect(style.radius).toBe("12px");
        expect(style.border).toBe("rgba(0, 94, 255, 0.26)");
      }
      const intro = page.locator(".page-intro");
      if (await intro.count()) {
        expect(
          await intro.evaluate(
            (element) => getComputedStyle(element, "::after").backgroundColor,
          ),
        ).toBe("rgb(0, 94, 255)");
        const size = await intro
          .locator("h1")
          .evaluate((element) =>
            parseFloat(getComputedStyle(element).fontSize),
          );
        expect(size).toBeLessThanOrEqual(width <= 520 ? 42 : 68);
      } else {
        const marker = page.locator(".expertise-section");
        expect(
          await marker.evaluate(
            (element) => getComputedStyle(element, "::before").content,
          ),
        ).toBe("none");
        await expect(page.locator(".hero-section")).toHaveCSS(
          "border-bottom-width",
          "5px",
        );
        await expect(page.locator(".hero-section")).toHaveCSS(
          "border-bottom-color",
          "rgb(0, 94, 255)",
        );
        expect(
          await page
            .locator(".selected-section")
            .evaluate(
              (element) =>
                getComputedStyle(element, "::before").backgroundColor,
            ),
        ).toBe("rgb(0, 94, 255)");
        await marker.scrollIntoViewIfNeeded();
      }
      await page.screenshot({
        path: testInfo.outputPath(
          `hierarchy-${width}-${path.replaceAll("/", "_")}.png`,
        ),
      });
    }
  }
});

test("dark backgrounds only across representative routes and viewports", async ({
  page,
}) => {
  const allowedBackgrounds = [
    "rgba(0, 0, 0, 0)",
    "rgba(0, 94, 255, 0.86)",
    "rgba(21, 26, 33, 0.72)",
    "rgb(15, 18, 22)",
    "rgb(21, 26, 33)",
    "rgb(37, 48, 58)",
    "rgb(0, 94, 255)",
  ];

  for (const viewport of [
    { width: 320, height: 700 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    for (const path of [
      "/",
      "/work/celo-credentials/",
      "/fr/contact/",
      "/fr/a-propos/",
      "/fr/realisations/",
    ]) {
      await page.goto(path);
      const result = await page.locator("*").evaluateAll(
        (elements, allowed) =>
          elements
            .map((element) => ({
              element: element.tagName.toLowerCase(),
              classes: element.getAttribute("class"),
              color: getComputedStyle(element).backgroundColor,
            }))
            .filter((entry) => !allowed.includes(entry.color))
            .slice(0, 10),
        allowedBackgrounds,
      );
      expect(result).toEqual([]);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    }
  }
});

for (const path of ["/", "/fr/", "/work/celo-credentials/", "/fr/contact/"]) {
  test(`@a11y automated accessibility scan ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
