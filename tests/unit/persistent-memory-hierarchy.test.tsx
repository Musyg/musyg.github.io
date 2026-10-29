import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../../src/App";
import { projects, publicLinkUrl, sectionOrder } from "../../src/content/site";

describe("Persistent Memory evidence hierarchy", () => {
  it.each(["fr", "en"] as const)(
    "presents the three priorities before implementation details in %s",
    (locale) => {
      const project = projects.find((item) => item.id === "persistent-memory")!;
      const pathname = `${locale === "fr" ? "/fr/realisations" : "/work"}/persistent-memory/`;
      const { container } = render(<App pathname={pathname} />);
      const sections = Array.from(
        container.querySelectorAll(".case-body > section"),
      );
      expect(
        sections
          .slice(0, 3)
          .map((section) => section.getAttribute("aria-labelledby")),
      ).toEqual([
        "persistent-memory-summary",
        "persistent-memory-results",
        "persistent-memory-role",
      ]);
      expect(
        sections.map(
          (section) => section.querySelector(".section-number")?.textContent,
        ),
      ).toEqual(sections.map((_, index) => String(index + 1).padStart(2, "0")));
      const titles = Array.from(
        container.querySelectorAll(".memory-priorities h3"),
        (heading) => heading.textContent,
      );
      expect(titles).toEqual(
        locale === "fr"
          ? [
              "Garder le fil entre les sessions",
              "Réutiliser l’expérience d’une autre tâche",
              "Garder une mémoire cohérente après une correction ou une panne",
            ]
          : [
              "Keep the thread across sessions",
              "Reuse experience from another task",
              "Keep memory consistent after a correction or failure",
            ],
      );
      const cards = container.querySelectorAll(".memory-priorities > li");
      expect(cards).toHaveLength(3);
      expect(cards[0]).toHaveTextContent(/77.*96.*29\/96/);
      expect(cards[0]).toHaveTextContent(
        locale === "fr" ? /Neuf.*inconnus/ : /Nine.*unknown/,
      );
      expect(cards[1]).toHaveTextContent(/Luna.*22.*24.*13\/24.*7\/24/);
      expect(cards[2]).toHaveTextContent(/100.*751.*389.*SQLite/);
      const paths = [
        "answer-quality-20261029/",
        "action-20261023/experience/",
        "lifecycle-20261022/",
      ];
      cards.forEach((card, index) => {
        const source = project.links.find((link) =>
          link.url.includes(paths[index]),
        )!;
        expect(card.querySelector("a")).toHaveAttribute(
          "href",
          publicLinkUrl(source, locale),
        );
      });
      const details = container.querySelector(".memory-measurements")!;
      expect(details).not.toHaveAttribute("open");
      expect(details.querySelectorAll("p")).toHaveLength(
        project.sections.results[locale].length,
      );
      for (const paragraph of project.sections.results[locale])
        expect(details).toHaveTextContent(paragraph);
      const hero = container.querySelectorAll(".case-actions a");
      expect(hero).toHaveLength(3);
      expect(hero[0]).toHaveAttribute(
        "href",
        `/demos/persistent-memory/?lang=${locale}`,
      );
      expect(hero[1]).toHaveAttribute(
        "href",
        locale === "fr"
          ? "https://github.com/Musyg/persistent-memory/blob/main/README.fr.md"
          : "https://github.com/Musyg/persistent-memory",
      );
      expect(hero[2]).toHaveAttribute("href", "#persistent-memory-results");
      expect(container.querySelectorAll(".evidence-links a")).toHaveLength(
        project.links.length,
      );
      expect(
        container.querySelector(
          ".case-toc a[href='#persistent-memory-results']",
        ),
      ).toBeInTheDocument();
    },
  );

  it("does not change the section order or hero links of another project", () => {
    const project = projects.find((item) => item.id === "agent-resilience")!;
    const { container } = render(<App pathname="/work/agent-resilience/" />);
    const expected = sectionOrder.filter(
      (key) => key === "evidence" || project.sections[key].en.length,
    );
    expect(
      Array.from(
        container.querySelectorAll(".case-body > section"),
        (section) => section.getAttribute("aria-labelledby"),
      ),
    ).toEqual(expected.map((key) => `agent-resilience-${key}`));
    expect(container.querySelectorAll(".case-actions a")).toHaveLength(
      project.links.length,
    );
    expect(container.querySelector(".memory-results")).not.toBeInTheDocument();
  });
});
