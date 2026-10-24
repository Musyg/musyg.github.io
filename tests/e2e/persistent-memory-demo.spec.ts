import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const trace = JSON.parse(
  readFileSync("public/demos/persistent-memory/trace.json", "utf8"),
);
type ComparisonRead = {
  allowed: boolean;
  reason: string;
  content?: string | null;
};
type ComparisonCase = { phase: string } & Record<
  "reference" | "persistent_memory",
  Record<string, Record<string, ComparisonRead>>
>;
const comparison = JSON.parse(
  readFileSync("public/demos/persistent-memory/comparison.json", "utf8"),
);
const memoryOnOff = JSON.parse(
  readFileSync("public/demos/persistent-memory/memory-on-off.json", "utf8"),
);
const comparisonMoments = [
  ["before_rebuild", "after_rebuild"],
  ["after"],
  ["after"],
];
const roles = ["date_v1", "brief_v1", "brief_v2", "brief_v2", "control"];

for (const locale of ["en", "fr"]) {
  for (const width of [1440, 390, 320]) {
    test(`persistent memory ${locale} at ${width}px`, async ({
      page,
    }, testInfo) => {
      const externalRequests: string[] = [];
      const videoRequests: string[] = [];
      const errors: string[] = [];
      page.on("request", (request) => {
        if (new URL(request.url()).pathname.endsWith("/walkthrough.mp4"))
          videoRequests.push(request.url());
        if (
          !new URL(request.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/)
        ) {
          externalRequests.push(request.url());
        }
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: undefined,
        });
      });
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(
        `/demos/persistent-memory/?lang=${locale}&campaign=portfolio#proof`,
      );
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      const description = page.locator('meta[name="description"]');
      const expectedDescription = (language: string) =>
        language === "fr"
          ? "Explorez les preuves publiées de Persistent Memory : corrections, reprise après interruption, efficacité et transfert d’expérience, puis le parcours interactif Atlas."
          : "Explore the published Persistent Memory studies on corrections, recovery, efficiency and learned experience, then step through the interactive Atlas example.";
      await expect(description).toHaveAttribute(
        "content",
        expectedDescription(locale),
      );
      await expect(page.locator("#published-proof")).toBeVisible();
      await expect(page.locator("#published-proof tbody > tr")).toHaveCount(4);
      await expect(page.locator('a[href="#published-proof"]')).toHaveText(
        locale === "fr" ? "Preuves publiées" : "Published evidence",
      );
      for (const [key, label] of [
        [
          "proofResult",
          locale === "fr" ? "Résultat observé" : "Observed result",
        ],
        ["proofScope", locale === "fr" ? "Portée" : "Scope"],
      ]) {
        const cells = page.locator(
          `#published-proof td[data-i18n-label="${key}"]`,
        );
        await expect(cells).toHaveCount(4);
        for (let index = 0; index < 4; index++) {
          await expect(cells.nth(index)).toHaveAttribute("data-label", label);
        }
      }
      await expect(page.locator("#memory-results")).toBeVisible();
      await expect(page.locator("#memory-presence-count")).toHaveText("8 / 8");
      await expect(page.locator("#memory-absence-count")).toHaveText("4 / 8");
      await expect(page.locator("#memory-gain-count")).toHaveText("3");
      await expect(page.locator(".memory-case")).toHaveCount(8);
      await expect(page.locator(".memory-answer")).toHaveCount(15);
      await page.locator("#memory-cases > summary").focus();
      await page.keyboard.press("Enter");
      const firstCase = page.locator("#memory-case-MC20N01 > summary");
      await firstCase.focus();
      await page.keyboard.press("Enter");
      await expect(
        page.locator("#memory-case-MC20N01 .memory-answer").first(),
      ).toBeVisible();
      const actualAnswers = await page
        .locator(".memory-case")
        .evaluateAll((cases) =>
          cases.map((item) => ({
            id: item.id.replace("memory-case-", ""),
            answers: Array.from(item.querySelectorAll(".memory-arm")).map(
              (arm) => ({
                name: (arm as HTMLElement).dataset.arm,
                answer:
                  arm.querySelector(".memory-answer")?.textContent ?? null,
                lang:
                  arm.querySelector(".memory-answer")?.getAttribute("lang") ??
                  null,
              }),
            ),
          })),
        );
      expect(actualAnswers).toEqual(
        memoryOnOff.cases.map(
          (item: {
            id: string;
            arms: Record<string, { answer: string | null; completed: boolean }>;
          }) => ({
            id: item.id,
            answers: ["presence", "absence"].map((name) => ({
              name,
              answer: item.arms[name].answer,
              lang: item.arms[name].completed ? "fr" : null,
            })),
          }),
        ),
      );
      await page.locator("#memory-method > summary").click();
      await expect(page.locator("#memory-method a[download]")).toHaveAttribute(
        "href",
        "memory-on-off.json",
      );
      await page.locator("#memory-method > summary").click();
      await page.locator("#memory-cases > summary").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#memory-case-list")).not.toBeVisible();
      const video = page.locator("#walkthrough-video");
      await expect(video).toHaveAttribute("preload", "none");
      await expect(video).toHaveAttribute("controls", "");
      await expect(video).toHaveAttribute("playsinline", "");
      for (const attribute of ["autoplay", "loop", "muted"])
        await expect(video).not.toHaveAttribute(attribute, /.*/);
      await expect(video).toHaveAttribute("poster", "walkthrough-poster.jpg");
      await expect(video.locator("source")).toHaveAttribute(
        "src",
        "walkthrough.mp4",
      );
      await expect(video.locator("source")).toHaveAttribute(
        "type",
        "video/mp4",
      );
      await expect(video.locator('track[kind="captions"]')).toHaveCount(2);
      await expect(video.locator("track[default]")).toHaveAttribute(
        "srclang",
        locale,
      );
      await expect(page.locator("#walkthrough-description")).toContainText(
        locale === "fr" ? "données fictives" : "fictional Atlas data",
      );
      await expect(page.locator("#walkthrough-transcript li")).toHaveCount(6);
      await expect(page.locator("#previous")).toBeDisabled();
      await expect(page.locator("[data-step]")).toHaveCount(5);
      for (const [index, event] of trace.events.entries()) {
        if (index) await page.locator("#next").click();
        await expect(page.locator("#status")).toHaveAttribute(
          "data-phase",
          event.phase,
        );
        await expect(page.locator(`[data-step="${index}"]`)).toHaveAttribute(
          "aria-current",
          "step",
        );
        const read = event.reads[roles[index]];
        await expect(page.locator("#answer")).toHaveText(
          read.allowed
            ? read.content
            : locale === "fr"
              ? "Aucune preuve admissible"
              : "No admissible evidence",
        );
        const observations = JSON.parse(
          (await page.locator("#machine").textContent())!,
        );
        expect(observations.reads[roles[index]]).toEqual(read);
        await expect(page.locator("#node-language")).toHaveAttribute(
          "data-state",
          "available",
        );
        await expect(page.locator("#node-date")).toHaveAttribute(
          "data-state",
          index < 3 ? "available" : "blocked",
        );
        await expect(page.locator("#node-brief")).toHaveAttribute(
          "data-state",
          index === 0 ? "absent" : index < 3 ? "available" : "blocked",
        );
        for (const source of ["date", "language"]) {
          await expect(page.locator(`#edge-${source}`)).toHaveAttribute(
            "data-linked",
            String(index !== 0),
          );
        }
        if (index === 2) {
          expect(observations.reads.old_brief_before_replacement).toEqual(
            event.reads.old_brief_before_replacement,
          );
          await expect(page.locator("#change-before")).toContainText(
            locale === "fr" ? "vendredi" : "Friday",
          );
          await expect(page.locator("#change-after")).toContainText(
            locale === "fr" ? "lundi" : "Monday",
          );
          await expect(page.locator("#change-after")).toContainText(
            locale === "fr" ? "avant remplacement" : "before replacement",
          );
        }
        if (index === 4) {
          expect(observations.details.retained_current_authority).toBe(true);
          await expect(page.locator("#restore-authority")).toBeVisible();
          await expect(page.locator("#restore-authority")).toContainText(
            locale === "fr"
              ? /autorité actuelle.*séparément/i
              : /current authority.*separately/i,
          );
        } else {
          await expect(page.locator("#restore-authority")).not.toBeVisible();
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
      await expect(page.locator("#next")).toBeDisabled();
      await expect(
        page.locator('[data-role="quarantined_control"]'),
      ).toContainText("authority_or_store_unavailable");
      await page.locator("#previous").click();
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "revoke",
      );
      await page.locator('[data-step="2"]').focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "correct",
      );
      await expect(page.locator('[data-step="2"]')).toBeFocused();
      await page.locator("#language").click();
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        locale === "fr" ? "en" : "fr",
      );
      await expect(video.locator("track[default]")).toHaveAttribute(
        "srclang",
        locale === "fr" ? "en" : "fr",
      );
      await expect(description).toHaveAttribute(
        "content",
        expectedDescription(locale === "fr" ? "en" : "fr"),
      );
      await expect(page.locator("#proof-experience-study")).toHaveAttribute(
        "href",
        `https://github.com/Musyg/persistent-memory/blob/main/benchmarks/action-20261023/experience/README${locale === "fr" ? "" : ".fr"}.md`,
      );
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "correct",
      );
      await page.locator("#language").click();
      await expect(video.locator("track[default]")).toHaveAttribute(
        "srclang",
        locale,
      );
      await expect(page.locator("#back")).toHaveAttribute(
        "href",
        locale === "fr"
          ? "/fr/realisations/persistent-memory/"
          : "/work/persistent-memory/",
      );
      await page.locator("#node-language").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#node-language")).toBeFocused();
      await expect(page.locator("details.technical")).toHaveCount(1);
      await expect(page.locator("#machine")).toBeVisible();
      expect(
        JSON.parse((await page.locator("#inspector-read").textContent())!).read,
      ).toEqual(trace.events[2].reads.control);
      await page.locator("#node-brief").click();
      expect(
        JSON.parse((await page.locator("#inspector-read").textContent())!).read,
      ).toEqual(trace.events[2].reads.brief_v2);
      await page.locator("#technical > summary").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#machine")).not.toBeVisible();
      await page.keyboard.press("Enter");
      await expect(page.locator("#machine")).toBeVisible();
      expect(
        JSON.parse((await page.locator("#machine").textContent())!),
      ).toEqual({
        operations: trace.events[2].operations,
        reads: trace.events[2].reads,
        details: trace.events[2].details,
      });
      await page.keyboard.press("Enter");
      await expect(page.locator("#machine")).not.toBeVisible();
      await expect(page.locator("#comparison-results")).toBeVisible();
      await expect(page.locator("#comparison-rows > tr")).toHaveCount(4);
      const observedComparison = await page
        .locator("#comparison-rows")
        .evaluate((table) =>
          Array.from(table.querySelectorAll(".comparison-read")).map(
            (element) => ({
              phase: (element.closest("tr") as HTMLElement).dataset
                .comparisonPhase,
              moment: (element.closest("tr") as HTMLElement).dataset.moment,
              branch: (element.closest("td") as HTMLElement).dataset.branch,
              role: (element as HTMLElement).dataset.role,
              allowed: (element as HTMLElement).dataset.allowed === "true",
              content:
                element.querySelector(".comparison-content")?.textContent ??
                null,
              reason: (element as HTMLElement).dataset.reason,
            }),
          ),
        );
      const expectedComparison = comparison.cases.flatMap(
        (item: ComparisonCase, index: number) =>
          comparisonMoments[index].flatMap((moment) =>
            (["reference", "persistent_memory"] as const).flatMap((branch) =>
              ["brief"].map((role) => {
                const read = item[branch][moment][role];
                return {
                  phase: item.phase,
                  moment,
                  branch,
                  role,
                  allowed: read.allowed,
                  content: read.allowed ? read.content : null,
                  reason: read.reason,
                };
              }),
            ),
          ),
      );
      expect(observedComparison).toEqual(expectedComparison);
      await expect(page.locator("#comparison-contract")).toContainText(
        locale === "fr" ? "reconstruction explicite" : "explicit rebuild",
      );
      await expect(page.locator("#comparison-authority")).toContainText(
        locale === "fr" ? "témoin de fraîcheur" : "freshness witness",
      );
      await expect(page.locator("#comparison-language")).toContainText(
        locale === "fr" ? "français" : "French",
      );
      await page.locator("#comparison-proof > summary").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#comparison-receipts")).toBeVisible();
      expect(
        JSON.parse((await page.locator("#comparison-receipts").textContent())!),
      ).toEqual(comparison);
      await expect(page.locator("#comparison-code")).toHaveAttribute(
        "href",
        /^https:\/\/github\.com\/Musyg\/persistent-memory\/blob\/[a-f0-9]{40}\/examples\/portfolio_demo\.py$/,
      );
      await page.keyboard.press("Enter");
      await expect(page.locator("#comparison-receipts")).not.toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (width !== 390) {
        const scan = await new AxeBuilder({ page }).analyze();
        expect(scan.violations).toEqual([]);
      }
      const screenshotName = `demo-${locale}-${width}.png`;
      const screenshotDirectory = process.env.DEMO_SCREENSHOT_DIR;
      if (screenshotDirectory)
        mkdirSync(screenshotDirectory, { recursive: true });
      await page.screenshot({
        path: screenshotDirectory
          ? join(screenshotDirectory, screenshotName)
          : testInfo.outputPath(screenshotName),
        fullPage: true,
      });
      expect(videoRequests).toEqual([]);
      await page.locator("#walkthrough-transcript > summary").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("#walkthrough-transcript ol")).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(
        page.locator("#walkthrough-transcript ol"),
      ).not.toBeVisible();
      await video.focus();
      await expect(video).toBeFocused();
      await video.evaluate(async (element: HTMLVideoElement) => {
        element.dispatchEvent(new Event("pointerdown"));
        await element.play();
      });
      await expect
        .poll(() =>
          video.evaluate((element: HTMLVideoElement) => element.currentTime),
        )
        .toBeGreaterThan(0);
      expect(videoRequests.length).toBeGreaterThan(0);
      const videoState = await video.evaluate((element: HTMLVideoElement) => {
        element.pause();
        return {
          width: element.videoWidth,
          height: element.videoHeight,
          error: element.error?.code ?? null,
          captions: Array.from(element.textTracks)
            .filter((track) => track.mode === "showing")
            .map((track) => track.language),
        };
      });
      expect(videoState).toEqual({
        width: 1440,
        height: 900,
        error: null,
        captions: [locale],
      });
      const playbackPosition = await video.evaluate(
        (element: HTMLVideoElement) => element.currentTime,
      );
      await page.locator("#language").click();
      expect(
        await video.evaluate(
          (element: HTMLVideoElement) => element.currentTime,
        ),
      ).toBe(playbackPosition);
      expect(
        await video.evaluate((element: HTMLVideoElement) =>
          Array.from(element.textTracks)
            .filter((track) => track.mode === "showing")
            .map((track) => track.language),
        ),
      ).toEqual([locale]);
      await page.locator("#language").click();
      await page.locator("#restart").click();
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "admit",
      );
      await expect(page.locator("#previous")).toBeDisabled();
      await page.goto(
        `/demos/persistent-memory/?lang=${locale}&step=3&campaign=portfolio#proof`,
      );
      await page.reload();
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "correct",
      );
      await page.locator("#next").click();
      await page.locator("#language").click();
      await page.goBack();
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(description).toHaveAttribute(
        "content",
        expectedDescription(locale),
      );
      await expect(page.locator("#proof-experience-study")).toHaveAttribute(
        "href",
        `https://github.com/Musyg/persistent-memory/blob/main/benchmarks/action-20261023/experience/README${locale === "fr" ? ".fr" : ""}.md`,
      );
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "revoke",
      );
      await page.goBack();
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "correct",
      );
      await page.goForward();
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "revoke",
      );
      const shared = new URL(page.url());
      expect(shared.searchParams.get("step")).toBe("4");
      expect(shared.searchParams.get("lang")).toBe(locale);
      expect(shared.searchParams.get("campaign")).toBe("portfolio");
      expect(shared.hash).toBe("#proof");
      await page.locator("#share").click();
      await expect(page.locator("#share-link")).toBeVisible();
      await expect(page.locator("#share-link")).toHaveValue(shared.href);
      await expect(page.locator("#share-link")).toBeFocused();
      await expect(page.locator("#share-status")).not.toHaveText("");
      await page.goto(
        "/demos/persistent-memory/?lang=invalid&step=99&campaign=portfolio#proof",
      );
      await expect(page.locator("html")).toHaveAttribute("lang", "fr");
      await expect(page.locator("#status")).toHaveAttribute(
        "data-phase",
        "admit",
      );
      expect(errors).toEqual([]);
      expect(externalRequests).toEqual([]);
    });
  }
}
