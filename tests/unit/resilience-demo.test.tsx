import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
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
    expect(Object.keys(trace.scenarios)).toEqual(["circuit", "dlq", "mqtt"]);
    for (const scenario of Object.values(trace.scenarios) as {
      source_sha256: string;
    }[]) {
      expect(scenario.source_sha256).toMatch(/^[a-f0-9]{64}$/);
    }
    expect(trace.scenarios.circuit.events.at(-1)).toMatchObject({
      state: "closed",
      attempts: 8,
      upstream_calls: 6,
      blocked: 2,
    });
    expect(
      trace.scenarios.circuit.events.filter(
        (event: { state: string }) => event.state === "half_open",
      ),
    ).toHaveLength(1);
    expect(html).not.toMatch(/<script[^>]+src=|__RECORDED_TRACE__|<iframe/);
    expect(html).toContain("#005EFF");
  });

  it.each(["fr", "en"])("replays all three scenarios in %s", (locale) => {
    const html = readFileSync(
      "public/demos/agent-resilience/index.html",
      "utf8",
    );
    const dom = new JSDOM(html, {
      runScripts: "dangerously",
      url: `https://demo.invalid/?lang=${locale}`,
    });
    try {
      const document = dom.window.document;
      const click = (selector: string) =>
        (document.querySelector(selector) as HTMLElement).click();
      const value = (id: string) => document.getElementById(id)!.textContent;
      for (const [name, steps, finalState, finalMetrics, sourceFile] of [
        ["circuit", 10, "CLOSED", ["8", "6", "2"], "circuit_breaker.py"],
        ["dlq", 8, "COMPLETED", ["0", "0", "0"], "dlq.py"],
        ["mqtt", 8, "CONNECTED", ["0", "3", "3"], "mqtt_buffer.py"],
      ] as const) {
        click(`[data-scenario="${name}"]`);
        for (let n = 0; n < steps; n++) click("#next");
        expect(value("state")).toBe(finalState);
        expect([value("attempts"), value("calls"), value("blocked")]).toEqual(
          finalMetrics,
        );
        expect(document.querySelector("#next")).toHaveProperty(
          "disabled",
          true,
        );
        expect(
          document.querySelector("#source")!.getAttribute("href"),
        ).toContain(sourceFile);
        expect(
          document
            .querySelector(`[data-scenario="${name}"]`)!
            .getAttribute("aria-pressed"),
        ).toBe("true");
      }
      click("#restart");
      expect(value("state")).toBe("OFFLINE");
      click("#play");
      expect(value("play")).toBe("Pause");
      click('[data-scenario="dlq"]');
      expect(value("state")).toBe("QUEUED");
      expect(value("play")).toBe(
        locale === "fr" ? "Lire la démo" : "Play demo",
      );
      click("#next");
      click("#language");
      expect(document.documentElement.lang).toBe(locale === "fr" ? "en" : "fr");
      expect(value("state")).toBe("PROCESSING");
    } finally {
      dom.window.close();
    }
  });
});
