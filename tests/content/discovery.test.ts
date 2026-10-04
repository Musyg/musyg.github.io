import { describe, expect, it } from "vitest";
import { render } from "../../src/entry-server";
import { engagementScope, engagements } from "../../src/content/engagements";
import { publicRoutes } from "../../src/routes";
import { professionalProfiles } from "../../src/content/site";

describe("worldwide expertise discovery", () => {
  it("keeps IPI explicit, authorized and distinct from AI engineering", () => {
    expect(engagements.security.fr.needs.join(" ")).toContain(
      "Injection indirecte de prompts (IPI, indirect prompt injection)",
    );
    expect(engagements.security.en.needs.join(" ")).toContain(
      "Indirect prompt injection (IPI)",
    );
    expect(engagements.security.fr.method).toContain("périmètre autorisé");
    expect(engagements.security.en.method).toContain("authorized scope");
    expect(engagements.ai.fr.title).not.toContain("sécurité");
    expect(engagementScope.fr).toContain("partout dans le monde");
    expect(engagementScope.en).toContain("worldwide");
  });

  for (const route of publicRoutes) {
    it(`links ${route.path} to the same factual public identity`, () => {
      const { head, html } = render(route.path);
      const json = head.match(
        /<script type="application\/ld\+json">(.*?)<\/script>/s,
      )![1];
      const graph = JSON.parse(json);
      const person = graph.find(
        (node: { "@type": string }) => node["@type"] === "Person",
      );
      expect(person["@id"]).toBe("https://musyg.com/#gilles-musy");
      expect(person.name).toBe("Gilles Musy");
      expect(person.alternateName).toBe("Musyg");
      expect(person.sameAs).toEqual(
        professionalProfiles.map((profile) => profile.url),
      );
      const service = graph.find(
        (node: { "@type": string }) => node["@type"] === "Service",
      );
      if (route.practice) {
        expect(service.areaServed).toBe("Worldwide");
        expect(service.provider["@id"]).toBe(person["@id"]);
        expect(service.name).toBe(
          engagements[route.practice][route.locale].title,
        );
        expect(html).toContain(engagements[route.practice][route.locale].title);
        expect(html).toContain(engagementScope[route.locale]);
        expect(html).toContain('id="engagement-title"');
      } else {
        expect(service).toBeUndefined();
      }
      expect(json).not.toMatch(/aggregateRating|reviewCount|award|priceRange/);
    });
  }

  it("does not describe a missing page as an offered service", () => {
    expect(render("/missing-page/").head).not.toContain("application/ld+json");
  });
});
