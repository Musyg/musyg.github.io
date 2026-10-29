import { readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { projects, sectionOrder } from "../../src/content/site";
import { aboutCopy } from "../../src/content/about";
import { canonicalUrl, publicRoutes, routeFor } from "../../src/routes";

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

describe("portfolio content contract", () => {
  it("uses only Talos as the public agency name across source and public assets", () => {
    for (const directory of ["src", "public"]) {
      for (const file of filesUnder(directory).filter((path) =>
        /\.(tsx?|html|js|json|svg|txt)$/i.test(path),
      )) {
        expect(readFileSync(file, "utf8"), file).not.toMatch(/herm[eè]s/i);
      }
    }
  });

  it("distinguishes Mika the real cat, the store assistant and separate SAV", () => {
    const project = projects.find((item) => item.id === "mikasshop")!;
    expect(project.status).toBe("store-and-integrations");
    expect(project.filters).toContain("ai");
    expect(project.projectStart).toEqual({ en: "2024", fr: "2024" });
    expect(project.stack).toEqual(
      expect.arrayContaining(["Python", "FastAPI", "SSE", "MQTT"]),
    );
    for (const locale of ["en", "fr"] as const) {
      expect(JSON.stringify(project)).not.toMatch(
        /chat IA Mika|Mika AI chat|Mika, a custom AI chat/,
      );
      expect(JSON.stringify(project.sections)).toContain(
        "Mika est le vrai chat",
      );
      expect(JSON.stringify(project.sections)).toContain(
        "Mika is the real cat",
      );
      expect(project.sections.architecture[locale].join(" ")).toContain(
        "Talos",
      );
      expect(project.sections.limitations[locale].join(" ")).toContain(
        locale === "fr" ? "n’a pas été vérifié" : "has not been verified",
      );
    }
    expect(JSON.stringify(project)).not.toContain("hermes-agency");
    expect(project.links[1].label.fr).toBe("Étude de la vitrine");
  });

  it("describes Inaricom supplier integration without claiming a completed rebuild", () => {
    const project = projects.find((item) => item.id === "inaricom")!;
    expect(project.status).toBe("active-rebuild");
    expect(project.projectStart).toEqual({ en: "2023", fr: "2023" });
    expect(project.filters).toEqual(["software", "web"]);
    for (const locale of ["en", "fr"] as const) {
      expect(project.sections.role[locale].join(" ")).toContain("DigiKey");
      expect(project.sections.architecture[locale].join(" ")).toContain(
        "WooCommerce",
      );
      expect(project.sections.limitations[locale].join(" ")).toContain(
        locale === "fr" ? "n’a pas été vérifiée" : "has not been verified",
      );
    }
    expect(JSON.stringify(project)).not.toContain("github.com/Musyg/Inaricom");
    expect(JSON.stringify(project)).not.toContain(
      "18dadcaf341f9dc5eeda293a047c91f982b8d313",
    );
  });

  it("presents Pedi-Sense beyond its storefront without claiming live backend activation", () => {
    const project = projects.find((item) => item.id === "pedi-sense")!;
    expect(project.status).toBe("store-and-integrations");
    expect(project.filters).toContain("ai");
    expect(project.projectStart).toEqual({ en: "Late 2022", fr: "Fin 2022" });
    expect(project.stack).toEqual(
      expect.arrayContaining(["Shopify", "Python", "MQTT", "Listmonk"]),
    );
    for (const locale of ["en", "fr"] as const) {
      expect(project.sections.architecture[locale].join(" ")).toContain(
        "Talos",
      );
      expect(project.sections.architecture[locale].join(" ")).toContain(
        "Listmonk",
      );
      expect(project.sections.limitations[locale].join(" ")).toContain(
        locale === "fr" ? "n’a pas été vérifiée" : "has not been verified",
      );
    }
    expect(JSON.stringify(project)).not.toContain("hermes-agency");
    expect(JSON.stringify(project)).not.toContain(
      "5eb44f8839a3a457099df26bc784b67c4bbf151c",
    );
    expect(project.links[1].label.fr).toBe("Étude de la vitrine");
  });

  it("keeps the report preview identical to the documented public source rendering", () => {
    const preview = readFileSync("public/stvault-report-cover.png");
    expect(createHash("sha256").update(preview).digest("hex")).toBe(
      "2455d96387bad36a01e3d29c06bd90b34ff1fd1f23c1a63977a8587c189679e0",
    );
    expect(preview.length).toBeLessThan(250_000);
  });

  it("uses a personal bilingual About and first-person contribution descriptions", () => {
    expect(aboutCopy.fr.introduction).toMatch(/^Je suis Gilles Musy/);
    expect(aboutCopy.en.introduction).toMatch(/^I’m Gilles Musy/);
    for (const locale of ["fr", "en"] as const) {
      expect(aboutCopy[locale].paragraphs).toHaveLength(5);
      for (const paragraph of aboutCopy[locale].paragraphs) {
        expect(paragraph).not.toContain("—");
      }
      for (const project of projects) {
        for (const section of sectionOrder) {
          for (const paragraph of project.sections[section][locale]) {
            expect(paragraph).not.toContain("Gilles Musy");
          }
        }
      }
    }
    expect(aboutCopy.fr.paragraphs[3]).toContain(
      "leurs méthodes et leurs responsabilités propres",
    );
    expect(aboutCopy.en.paragraphs[3]).toContain(
      "its own methods and responsibilities",
    );
  });

  it("uses the custom domain for metadata and the sitemap", () => {
    expect(canonicalUrl("/fr/")).toBe("https://musyg.com/fr/");
    const prerender = readFileSync("scripts/prerender.mjs", "utf8");
    expect(prerender).toContain('const siteOrigin = "https://musyg.com";');
  });

  it("serves prerendered directories and real errors on Hostinger", () => {
    const config = readFileSync("public/.htaccess", "utf8");
    expect(config).toContain("DirectoryIndex index.html");
    expect(config).toContain("Options -Indexes");
    expect(config).toContain("ErrorDocument 404 /404.html");
    expect(config).not.toContain("RewriteRule");
  });

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
