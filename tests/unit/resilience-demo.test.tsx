import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../../src/App";
import { projects, publicLinkUrl } from "../../src/content/site";

describe("Agent Resilience demo integration", () => {
  it.each([
    ["/work/agent-resilience/", "en", "Try the demo"],
    ["/fr/realisations/agent-resilience/", "fr", "Voir la démo"],
  ] as const)(
    "exposes the localized demo from %s",
    (pathname, locale, label) => {
      render(<App pathname={pathname} />);
      for (const link of screen.getAllByRole("link", { name: label })) {
        expect(link).toHaveAttribute(
          "href",
          `/demos/agent-resilience/?lang=${locale}`,
        );
      }
      const project = projects.find((item) => item.id === "agent-resilience")!;
      expect(publicLinkUrl(project.links[0], locale)).toBe(
        `/demos/agent-resilience/?lang=${locale}`,
      );
      expect(project.sections.results[locale].join(" ")).toMatch(
        /three failures|trois échecs/,
      );
    },
  );

  it("embeds exactly the exported Python observations", () => {
    const prefix = "public/demos/agent-resilience/";
    const html = readFileSync(`${prefix}index.html`, "utf8");
    const trace = JSON.parse(readFileSync(`${prefix}trace.json`, "utf8"));
    const embedded = html.match(
      /<script id="recorded-trace" type="application\/json">([\s\S]*?)<\/script>/,
    )![1];
    expect(JSON.parse(embedded)).toEqual(trace);
    expect(trace.source_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(trace.events.at(-1)).toMatchObject({
      state: "closed",
      attempts: 8,
      upstream_calls: 6,
      blocked: 2,
    });
    expect(
      trace.events.filter(
        (event: { state: string }) => event.state === "half_open",
      ),
    ).toHaveLength(1);
    expect(html).not.toMatch(/<script[^>]+src=|__RECORDED_TRACE__|<iframe/);
    expect(html).toContain("#005EFF");
  });
});
