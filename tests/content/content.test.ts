import { readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { projects, sectionOrder } from "../../src/content/site";
import { publicRoutes, routeFor } from "../../src/routes";

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

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
    expect(css).not.toMatch(/min-width:\s*320px/iu);
  });

  it("locks the favicon and social-preview integration", () => {
    const template = readFileSync(join(process.cwd(), "index.html"), "utf8");
    const server = readFileSync(
      join(process.cwd(), "src", "entry-server.tsx"),
      "utf8",
    );
    const favicon = readFileSync(
      join(process.cwd(), "public", "favicon.svg"),
      "utf8",
    );
    const preview = readFileSync(
      join(process.cwd(), "public", "social-preview.png"),
    );

    expect(template).toContain(
      '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />',
    );
    expect(server).toContain('canonicalUrl("/social-preview.png")');
    expect(server).toContain('property="og:image:width" content="1200"');
    expect(server).toContain('property="og:image:height" content="630"');
    expect(server).toContain('property="og:image:alt"');
    expect(server).toContain('name="twitter:image:alt"');
    expect(new Set(favicon.match(/#[0-9a-f]{6}/giu))).toEqual(
      new Set(["#005EFF"]),
    );
    expect(preview.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(preview.readUInt32BE(16)).toBe(1200);
    expect(preview.readUInt32BE(20)).toBe(630);
  });

  it("keeps email addresses out of every public asset", () => {
    const publicDirectory = join(process.cwd(), "public");

    for (const asset of filesUnder(publicDirectory)) {
      expect(readFileSync(asset).toString("latin1"), asset).not.toMatch(
        /[\w.+-]+@[\w.-]+\.[a-z]{2,}/iu,
      );
    }
  });

  it("locks the approved compact mark in the semantic header wordmark", () => {
    const app = readFileSync(join(process.cwd(), "src", "App.tsx"), "utf8");
    const mark = readFileSync(join(process.cwd(), "public", "header-mark.svg"));

    expect(app).toContain('className="wordmark"');
    expect(app).toContain('className="header-mark"');
    expect(app).toContain('src="/header-mark.svg"');
    expect(app).toContain("<span>Gilles Musy</span>");
    expect(createHash("sha256").update(mark).digest("hex").toUpperCase()).toBe(
      "F64A7A568902602E234AEAF48800F413EE30CABB8E5686836C15AAE355EDD8B7",
    );
  });

  it("locks the approved bounded hero refinement", () => {
    const app = readFileSync(join(process.cwd(), "src", "App.tsx"), "utf8");
    const css = readFileSync(join(process.cwd(), "src", "App.css"), "utf8");

    expect(app).not.toContain('className="hero-grid"');
    expect(app.match(/className="hero-trace hero-trace-/gu)).toHaveLength(6);
    expect(app).toContain('d="M0 132H238V254H418"');
    expect(app).toContain('d="M0 126H82V206H164"');
    expect(app).toContain('document.addEventListener("visibilitychange"');
    expect(css).toContain("stroke-width: 0.55");
    expect(css).toContain("font-size: clamp(2.6rem, 4.25vw, 4.5rem)");
    expect(css).toContain("font-size: clamp(1.8rem, 9vw, 2.4rem)");
    expect(css).toContain("background: rgb(0 94 255 / 86%)");
    expect(css).toContain("background: rgb(21 26 33 / 72%)");
    expect(css).toContain("border-color: var(--border-functional)");
    expect(css).toContain(".is-document-hidden .hero-trace");
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.hero-trace\s*\{\s*display:\s*none/iu,
    );
  });

  it("limits the approved review mark to the Security Reviews case study", () => {
    const app = readFileSync(join(process.cwd(), "src", "App.tsx"), "utf8");
    const mark = readFileSync(
      join(process.cwd(), "public", "security-review-mark.svg"),
    );
    const svg = mark.toString("utf8");

    expect(app).toContain('project.id === "security-reviews"');
    expect(app).toContain('className="security-review-case-mark"');
    expect(app).toContain('src="/security-review-mark.svg"');
    expect(app).toContain('alt=""');
    expect(app).toContain('aria-hidden="true"');
    expect(new Set(svg.match(/#[0-9a-f]{6}/giu))).toEqual(new Set(["#005EFF"]));
    expect(createHash("sha256").update(mark).digest("hex").toUpperCase()).toBe(
      "4FA44EE33622C012AFB3B7B0DFA360DD0783DD116FFAA9722DF054560584F8E3",
    );
  });
});
