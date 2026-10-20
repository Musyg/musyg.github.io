import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../../src/App";
import { projects, publicLinkUrl } from "../../src/content/site";

const demoPrefix = "public/demos/agent-resilience/";
const demoHtml = () => readFileSync(`${demoPrefix}index.html`, "utf8");
const demoTrace = () =>
  JSON.parse(readFileSync(`${demoPrefix}trace.json`, "utf8"));
const recordedJson = (html: string) =>
  html.match(
    /<script id="recorded-trace" type="application\/json">([\s\S]*?)<\/script>/,
  )![1];

function player(query = "?lang=en", html = demoHtml()) {
  let sequence = 0;
  const intervals = new Map<number, { callback: () => void; delay: number }>();
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    url: `https://demo.invalid/demos/agent-resilience/${query}`,
    beforeParse(window) {
      window.setInterval = ((callback: () => void, delay: number) => {
        intervals.set(++sequence, { callback, delay });
        return sequence;
      }) as typeof window.setInterval;
      window.clearInterval = (id) => {
        intervals.delete(Number(id));
      };
    },
  });
  const document = dom.window.document;
  return {
    dom,
    document,
    intervals,
    click: (selector: string) =>
      (document.querySelector(selector) as HTMLElement).click(),
    text: (id: string) => document.getElementById(id)!.textContent!,
    tick: () => {
      for (const { callback } of [...intervals.values()]) callback();
    },
  };
}

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

  it.each([
    ["fr", ["0,000 ms", "0,123 ms", "0,246 ms", "2050,123 ms", "< 0,001 ms"]],
    ["en", ["0.000 ms", "0.123 ms", "0.246 ms", "2050.123 ms", "< 0.001 ms"]],
  ] as const)(
    "shows recorded elapsed milliseconds in %s",
    (locale, expected) => {
      const html = readFileSync(
        "public/demos/agent-resilience/index.html",
        "utf8",
      );
      const embedded = html.match(
        /<script id="recorded-trace" type="application\/json">([\s\S]*?)<\/script>/,
      )![1];
      const trace = JSON.parse(embedded);
      const times = [0, 0.000123, 0.000246, 2.050123, 0.0000004];
      for (const scenario of Object.values(trace.scenarios) as {
        events: { elapsed_s: number }[];
      }[]) {
        times.forEach((seconds, index) => {
          scenario.events[index].elapsed_s = seconds;
        });
      }
      const dom = new JSDOM(html.replace(embedded, JSON.stringify(trace)), {
        runScripts: "dangerously",
        url: `https://demo.invalid/?lang=${locale}`,
      });
      try {
        const document = dom.window.document;
        for (const scenario of ["circuit", "dlq", "mqtt"]) {
          (
            document.querySelector(
              `[data-scenario="${scenario}"]`,
            ) as HTMLElement
          ).click();
          for (const [index, formatted] of expected.entries()) {
            if (index) (document.getElementById("next") as HTMLElement).click();
            expect(document.getElementById("step")!.textContent).toContain(
              formatted,
            );
            expect(
              document.querySelectorAll("#rows tr")[index].children[1]
                .textContent,
            ).toBe(formatted);
          }
          expect(document.getElementById("step")!.title).toMatch(
            /depuis le début de l’exécution|since execution started/,
          );
        }
        (document.getElementById("language") as HTMLElement).click();
        expect(document.getElementById("step")!.textContent).toContain(
          locale === "fr" ? "< 0.001 ms" : "< 0,001 ms",
        );
      } finally {
        dom.window.close();
      }
    },
  );

  it.each(["en", "fr"])(
    "supports previous, timeline and trace navigation in %s",
    (locale) => {
      const p = player(`?lang=${locale}&scenario=dlq`);
      try {
        expect(p.document.querySelector("#previous")).toHaveProperty(
          "disabled",
          true,
        );
        expect(p.document.querySelectorAll("#timeline button")).toHaveLength(9);
        p.click('#timeline button[data-step="4"]');
        expect(p.text("state")).toBe("DLQ");
        expect(
          p.document.querySelector('#timeline [aria-current="step"]'),
        ).toHaveAttribute("data-step", "4");
        p.click("#previous");
        expect(p.text("state")).toBe("PROCESSING");
        p.click('#rows button[data-step="8"]');
        expect(p.text("state")).toBe("COMPLETED");
        expect(p.document.querySelector("#next")).toHaveProperty(
          "disabled",
          true,
        );
        expect(p.text("outcome-summary")).toMatch(/task-42/);
        expect(p.text("journey")).toMatch(/task-42/);
        p.click("#restart");
        expect(
          p.document.querySelector('#timeline [aria-current="step"]'),
        ).toHaveAttribute("data-step", "0");
        expect(p.document.querySelector("#back-to-project")).toHaveAttribute(
          "href",
          locale === "fr"
            ? "/fr/realisations/agent-resilience/"
            : "/work/agent-resilience/",
        );
      } finally {
        p.dom.window.close();
      }
    },
  );

  it("changes playback speed without changing recorded execution measurements", () => {
    const p = player("?lang=en&scenario=dlq");
    try {
      const originalJson =
        p.document.getElementById("recorded-trace")!.textContent;
      const originalTime =
        p.document.querySelectorAll("#rows tr")[1].children[1].textContent;
      p.click("#play");
      expect([...p.intervals.values()].map((item) => item.delay)).toEqual([
        1800,
      ]);
      p.tick();
      expect(p.text("state")).toBe("PROCESSING");
      const speed = p.document.getElementById("speed") as HTMLSelectElement;
      speed.value = "2";
      speed.dispatchEvent(new p.dom.window.Event("change", { bubbles: true }));
      expect([...p.intervals.values()].map((item) => item.delay)).toEqual([
        900,
      ]);
      expect(p.text("step")).toContain(originalTime);
      p.click("#language");
      expect(p.intervals.size).toBe(1);
      p.click("#play");
      expect(p.intervals.size).toBe(0);
      p.tick();
      expect(p.text("state")).toBe("PROCESSING");
      speed.value = "0.5";
      speed.dispatchEvent(new p.dom.window.Event("change", { bubbles: true }));
      expect(p.intervals.size).toBe(0);
      p.click("#play");
      expect([...p.intervals.values()].map((item) => item.delay)).toEqual([
        3600,
      ]);
      p.click("#previous");
      expect(p.intervals.size).toBe(0);
      p.click("#play");
      Object.defineProperty(p.document, "hidden", {
        value: true,
        configurable: true,
      });
      p.document.dispatchEvent(new p.dom.window.Event("visibilitychange"));
      expect(p.intervals.size).toBe(0);
      expect(p.document.getElementById("recorded-trace")!.textContent).toBe(
        originalJson,
      );
      p.click('#timeline button[data-step="8"]');
      p.click("#play");
      expect(p.text("state")).toBe("QUEUED");
      for (let i = 0; i < 8; i++) p.tick();
      expect(p.text("state")).toBe("COMPLETED");
      expect(p.intervals.size).toBe(0);
    } finally {
      p.dom.window.close();
    }
  });

  it("preserves a keyboard-focused step button while automatic playback advances", () => {
    const p = player("?lang=en&scenario=dlq");
    try {
      p.click("#play");
      for (const container of ["timeline", "rows"]) {
        const button = p.document.querySelector(
          `#${container} button[data-step="4"]`,
        ) as HTMLButtonElement;
        button.focus();
        p.tick();
        expect(p.document.activeElement).toHaveAttribute("data-step", "4");
        expect(
          p.document.activeElement!.closest(`#${container}`),
        ).not.toBeNull();
      }
      expect(p.text("step")).toContain("3/9");
    } finally {
      p.dom.window.close();
    }
  });

  it("shares steps and preserves unrelated query/hash through navigation and history", async () => {
    const p = player("?lang=fr&scenario=dlq&step=5&ref=portfolio#trace");
    try {
      expect(p.text("state")).toBe("DLQ");
      p.click("#next");
      p.click("#language");
      expect(p.dom.window.location.search).toContain("lang=en");
      expect(new URL(p.dom.window.location.href).searchParams.get("step")).toBe(
        "6",
      );
      expect(new URL(p.dom.window.location.href).searchParams.get("ref")).toBe(
        "portfolio",
      );
      expect(p.dom.window.location.hash).toBe("#trace");
      p.click('[data-scenario="mqtt"]');
      expect(new URL(p.dom.window.location.href).searchParams.get("step")).toBe(
        "1",
      );
      p.click("#play");
      p.dom.window.history.back();
      await new Promise((resolve) => p.dom.window.setTimeout(resolve, 25));
      expect(p.text("state")).toBe("DLQ");
      expect(p.text("step")).toContain("6/9");
      expect(p.intervals.size).toBe(0);
      p.dom.window.history.forward();
      await new Promise((resolve) => p.dom.window.setTimeout(resolve, 25));
      expect(p.text("state")).toBe("OFFLINE");
      expect(p.dom.window.location.hash).toBe("#trace");
    } finally {
      p.dom.window.close();
    }
  });

  it.each([
    ["?lang=invalid&scenario=__proto__&step=wat", "fr", "CLOSED", "1/11"],
    ["?lang=fr&scenario=dlq&step=-4", "fr", "QUEUED", "1/9"],
    ["?lang=en&scenario=mqtt&step=99999", "en", "CONNECTED", "9/9"],
  ])(
    "handles malformed or out-of-range query %s",
    (query, locale, state, step) => {
      const p = player(query);
      try {
        expect(p.document.documentElement.lang).toBe(locale);
        expect(p.text("state")).toBe(state);
        expect(p.text("step")).toContain(step);
      } finally {
        p.dom.window.close();
      }
    },
  );

  it("keeps legacy circuit-only exports usable without comparison data", () => {
    const html = demoHtml();
    const legacy = demoTrace().scenarios.circuit;
    const p = player(
      "?lang=fr&scenario=dlq&step=2",
      html.replace(recordedJson(html), JSON.stringify(legacy)),
    );
    try {
      expect(
        p.document.querySelector('[data-scenario="circuit"]'),
      ).toHaveAttribute("aria-pressed", "true");
      expect(p.document.querySelector('[data-scenario="dlq"]')).toHaveProperty(
        "disabled",
        true,
      );
      expect(p.document.querySelector("#comparison")).toHaveProperty(
        "hidden",
        true,
      );
      p.click("#next");
      p.click("#previous");
      expect(p.text("step")).toContain("2/11");
    } finally {
      p.dom.window.close();
    }
  });

  it.each(["en", "fr"])(
    "shows full-run comparison totals from the actual exported events in %s",
    (locale) => {
      const trace = demoTrace();
      const comparison = trace.comparisons.circuit;
      expect(comparison.experiment_id).toEqual(expect.any(String));
      expect(comparison.input_schedule).toHaveLength(8);
      const p = player(`?lang=${locale}&scenario=circuit`);
      try {
        expect(p.document.querySelector("#comparison")).toHaveProperty(
          "hidden",
          false,
        );
        for (const mode of ["baseline", "protected"] as const) {
          const run = comparison[mode];
          const events = run.events as { outcome: string; called: boolean }[];
          const failures = events.filter(
            (event) => event.outcome === "failure",
          ).length;
          const successes = events.filter(
            (event) => event.outcome === "success",
          ).length;
          const blocked = events.filter(
            (event) => event.outcome === "blocked",
          ).length;
          expect(run.summary).toEqual({
            attempts: failures + successes + blocked,
            upstream_calls: events.filter((event) => event.called).length,
            failures,
            successes,
            blocked,
          });
          for (const [key, count] of Object.entries(run.summary)) {
            expect(
              p.document.querySelector(
                `[data-run="${mode}"][data-metric="${key}"]`,
              ),
            ).toHaveTextContent(String(count));
          }
        }
        expect(comparison.protected.events).toEqual(
          trace.scenarios.circuit.events,
        );
        expect(comparison.baseline.summary.upstream_calls).toBe(8);
        expect(comparison.protected.summary.upstream_calls).toBe(6);
        const totals = p.text("comparison");
        p.click('#timeline button[data-step="8"]');
        expect(p.text("comparison")).toBe(totals);
        p.click('[data-scenario="dlq"]');
        expect(p.document.querySelector("#comparison")).toHaveProperty(
          "hidden",
          true,
        );
        p.click('[data-scenario="mqtt"]');
        expect(p.document.querySelector("#comparison")).toHaveProperty(
          "hidden",
          true,
        );
      } finally {
        p.dom.window.close();
      }
    },
  );

  it("exposes recorded provenance and immutable source links", () => {
    const trace = demoTrace();
    expect(trace.provenance.source_revision).toMatch(/^[a-f0-9]{40}$/);
    expect(trace.provenance.python_version).toMatch(/^3\./);
    expect(trace.provenance.capture_sources_sha256).not.toEqual({});
    const p = player();
    try {
      expect(p.text("provenance")).toContain(
        trace.provenance.source_revision.slice(0, 12),
      );
      expect(p.text("provenance")).toContain(trace.provenance.python_version);
      expect(trace.provenance.source_dirty).toBe(false);
      expect(p.document.querySelector("#capture-source")).toHaveAttribute(
        "href",
        `https://github.com/Musyg/agent-resilience/blob/${trace.provenance.source_revision}/examples/visual_demo.py`,
      );
      expect(p.text("reproduction-command")).toContain(
        `git checkout ${trace.provenance.source_revision}`,
      );
      for (const [name, source] of [
        ["circuit", "circuit_breaker.py"],
        ["dlq", "dlq.py"],
        ["mqtt", "mqtt_buffer.py"],
      ]) {
        p.click(`[data-scenario="${name}"]`);
        expect(
          p.document.querySelector("#source")!.getAttribute("href"),
        ).toMatch(new RegExp(`/blob/[a-f0-9]{40}/agent_resilience/${source}$`));
        expect(p.text("provenance")).toContain(
          trace.scenarios[name].source_sha256,
        );
      }
    } finally {
      p.dom.window.close();
    }
  });

  it("does not claim an exact capture revision for modified sources", () => {
    const html = demoHtml();
    const trace = demoTrace();
    trace.provenance.source_dirty = true;
    const p = player(
      "?lang=en",
      html.replace(recordedJson(html), JSON.stringify(trace)),
    );
    try {
      expect(p.document.querySelector("#capture-source")).toBeNull();
      expect(p.text("reproduction-command")).not.toContain("git checkout");
      expect(p.text("provenance")).toContain(
        "Sources modified at capture time",
      );
    } finally {
      p.dom.window.close();
    }
  });
});
