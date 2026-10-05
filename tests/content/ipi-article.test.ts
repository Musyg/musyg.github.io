import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { render } from "../../src/entry-server";
import {
  ipiArticle,
  ipiImage,
  ipiJudgeQuote,
} from "../../src/content/ipi-article";
import { routeFor } from "../../src/routes";

describe("published IPI case study", () => {
  it("explains the five stages without repetitive caveats or review narration", () => {
    for (const copy of Object.values(ipiArticle)) {
      expect(copy.sections.slice(0, 5).map((section) => section.id)).toEqual([
        "task",
        "entry",
        "authority",
        "observation",
        "verdict",
      ]);
      expect(JSON.stringify(copy)).not.toMatch(
        /sans affirmer|without claiming|base réelle|real production|J’ai relu|I reviewed|Je ne reproduis|I am not reproducing/,
      );
    }
  });
  for (const locale of ["en", "fr"] as const) {
    it(`renders a self-contained, indexable ${locale} article`, () => {
      const article = ipiArticle[locale];
      const route = routeFor(article.path);
      expect(route.kind).toBe("article");
      expect(routeFor(route.counterpart).counterpart).toBe(article.path);
      const { html, head } = render(article.path);
      expect(html).toContain(ipiJudgeQuote);
      expect(html).toContain(ipiImage);
      expect(html).toContain("10/10");
      expect(html).toContain("White Ostrich Galactic");
      expect(html).not.toMatch(
        /submissionId|confirm_bulk_delete|simulation_controls|Brouillon privé|private draft/,
      );
      expect(head).toContain('"@type":"Article"');
      expect(head).toContain('"datePublished":"2026-10-05"');
      expect(head).toContain(`https://musyg.com${article.path}`);
      expect(head).toContain('hreflang="fr"');
      expect(head).toContain('hreflang="en"');
      expect(head).not.toContain("noindex");
      expect(
        render(locale === "fr" ? "/fr/publications/" : "/writing/").html,
      ).toContain(article.path);
      expect(
        render(
          locale === "fr" ? "/fr/recherche-securite/" : "/security-research/",
        ).html,
      ).toContain(article.path);
    });
  }
  it("retains the authentic verdict capture unchanged", () => {
    expect(
      createHash("sha256")
        .update(readFileSync(`public${ipiImage}`))
        .digest("hex"),
    ).toBe("7ba6789278bc6e39357db5e6bef3e039dd6db27a8973f85bfaee3d08500e702b");
  });
});
