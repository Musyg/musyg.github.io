import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { projects, sectionOrder } from "../../src/content/site";
import { publicRoutes, routeFor } from "../../src/routes";

describe("portfolio content contract", () => {
  it("keeps six projects with complete bilingual case-study sections", () => {
    expect(projects).toHaveLength(6);

    for (const project of projects) {
      expect(project.links.length).toBeGreaterThan(0);
      expect(project.stack.length).toBeGreaterThan(0);
      expect(Object.keys(project.sections).sort()).toEqual(
        [...sectionOrder].sort(),
      );

      for (const section of sectionOrder) {
        expect(project.sections[section].en.length).toBeGreaterThan(0);
        expect(project.sections[section].fr.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps every public route unique and paired with its locale counterpart", () => {
    const paths = publicRoutes.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);

    for (const route of publicRoutes) {
      const counterpart = routeFor(route.counterpart);
      expect(counterpart.kind).not.toBe("not-found");
      expect(counterpart.counterpart).toBe(route.path);
      expect(counterpart.locale).not.toBe(route.locale);
    }
  });

  it("excludes forbidden public-content patterns", () => {
    const serialized = JSON.stringify({ projects, publicRoutes });
    expect(serialized).not.toMatch(/—/u);
    expect(serialized).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(serialized).not.toMatch(/#0068c9/iu);
    expect(serialized).not.toMatch(
      /independent\s+(?:security\s+)?researcher/iu,
    );
    expect(serialized).not.toMatch(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/iu);
    expect(serialized).not.toMatch(/[a-z]:\\(?:users|windows)\\/iu);
  });

  it("locks the dark backgrounds and the single identity blue", () => {
    const css = readFileSync(join(process.cwd(), "src", "index.css"), "utf8");
    const appCss = readFileSync(join(process.cwd(), "src", "App.css"), "utf8");
    expect(css).toMatch(/--canvas:\s*#0f1216/iu);
    expect(css).toMatch(/--surface:\s*#151a21/iu);
    expect(css).toMatch(/--accent:\s*#005eff/iu);
    expect(`${css}\n${appCss}`).not.toMatch(
      /background(?:-color)?\s*:\s*(?:white|#fff(?:fff)?)/iu,
    );
    expect(`${css}\n${appCss}`).not.toMatch(/#0068c9/iu);
  });
});
