import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../../src/App";
import { ipiArticle } from "../../src/content/ipi-article";
import { professionalProfiles, projectById } from "../../src/content/site";

describe("balanced cybersecurity presentation", () => {
  for (const locale of ["en", "fr"] as const) {
    it(`shows all four security profiles in the ${locale} case study`, () => {
      const pathname =
        locale === "fr"
          ? "/fr/realisations/security-reviews/"
          : "/work/security-reviews/";
      const { container } = render(<App pathname={pathname} />);
      const main = container.querySelector("main")!;
      const profiles = main.querySelector(".profile-section")!;
      const securityProfiles = professionalProfiles.filter(
        (profile) => profile.platform !== "github",
      );
      expect(profiles.querySelectorAll(".profile-list > a")).toHaveLength(4);
      for (const profile of securityProfiles) {
        const link = profiles.querySelector(`a[href="${profile.url}"]`)!;
        expect(link).toHaveTextContent(profile.name);
        expect(link).toHaveTextContent(profile.handle);
        expect(link).toHaveTextContent(profile.association[locale]);
      }
      const actions = main.querySelector(".case-actions")!;
      expect(
        actions.querySelector('a[href="https://hackerone.com/gilmu"]'),
      ).not.toBeInTheDocument();
      expect(
        actions.querySelector('a[href="#security-profiles-title"]'),
      ).toBeInTheDocument();
      expect(main.querySelectorAll("#security-profiles-title")).toHaveLength(1);
      expect(main.querySelector(".security-report-context")).toHaveTextContent(
        locale === "fr"
          ? "ne correspond pas à une mission client"
          : "not a client engagement",
      );
    });

    it(`shows the full security scope and a direct IPI entry on the ${locale} homepage`, () => {
      const { container } = render(
        <App pathname={locale === "fr" ? "/fr/" : "/"} />,
      );
      const main = container.querySelector("main")!;
      const card = Array.from(main.querySelectorAll(".project-card")).find(
        (element) =>
          element.querySelector("h3")?.textContent === "Security Reviews",
      )!;
      for (const term of ["Web / API", "Solidity", "LLM / agents", "IPI"])
        expect(card).toHaveTextContent(term);
      const feature = main.querySelector('[aria-labelledby="home-ipi-title"]')!;
      expect(
        within(feature as HTMLElement).getByRole("heading", { level: 2 }),
      ).toHaveTextContent(ipiArticle[locale].title);
      expect(
        feature.querySelector(`a[href="${ipiArticle[locale].path}"]`),
      ).toBeInTheDocument();
      expect(main.querySelector(".writing-preview")).toHaveTextContent(
        "AI Adoption Playbook",
      );
      expect(main.querySelectorAll(".profile-list")).toHaveLength(0);
    });
  }

  it("keeps the catalogue distinct from the platform profiles and in the security practice", () => {
    const project = projectById("security-reviews")!;
    expect(project.practice).toBe("security");
    expect(project.filters).toEqual(["security", "web", "blockchain"]);
    expect(project.links[0].url).toBe(
      "https://github.com/Musyg/security-reviews",
    );
    for (const locale of ["en", "fr"] as const) {
      expect(project.sections.summary[locale][0]).toContain("Gray Swan");
      expect(project.sections.summary[locale][1]).toContain("GitHub");
    }
  });
});
