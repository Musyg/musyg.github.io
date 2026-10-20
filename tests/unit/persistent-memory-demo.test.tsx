import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../../src/App";

const prefix = "public/demos/persistent-memory/";
const html = () => readFileSync(`${prefix}index.html`, "utf8");
const recording = () => JSON.parse(readFileSync(`${prefix}trace.json`, "utf8"));
const embeddedTrace = (document: string) =>
  document.match(
    /<script id="recorded-trace" type="application\/json">([\s\S]*?)<\/script>/,
  )![1];
const primaryRoles = ["date_v1", "brief_v1", "brief_v2", "brief_v2", "control"];

describe("Persistent Memory recorded demonstration", () => {
  it.each([
    ["/work/persistent-memory/", "en", "Try the demo"],
    ["/fr/realisations/persistent-memory/", "fr", "Voir la démo"],
  ] as const)(
    "links the localized demonstration from %s",
    (path, lang, name) => {
      render(<App pathname={path} />);
      for (const link of screen.getAllByRole("link", { name })) {
        expect(link).toHaveAttribute(
          "href",
          `/demos/persistent-memory/?lang=${lang}`,
        );
      }
    },
  );

  it("embeds the real exported trace and preserves observed recovery decisions", () => {
    const trace = recording();
    expect(JSON.parse(embeddedTrace(html()))).toEqual(trace);
    expect(trace.schema).toBe("persistent-memory.portfolio-demo.trace.v1");
    expect(trace.synthetic).toBe(true);
    expect(trace.events.map((event: { phase: string }) => event.phase)).toEqual(
      ["admit", "derive", "correct", "revoke", "restore"],
    );
    expect(Object.values(trace.assertions)).not.toHaveLength(0);
    expect(
      Object.values(trace.assertions).every((value) => value === true),
    ).toBe(true);
    expect(trace.provenance.script_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(trace.events[2].reads.old_date.allowed).toBe(false);
    expect(trace.events[3].reads.brief_v2.allowed).toBe(false);
    expect(trace.events[4].reads.quarantined_control).toMatchObject({
      allowed: false,
      reason: "authority_or_store_unavailable",
    });
    expect(trace.events[4].reads.control.allowed).toBe(true);
    for (const role of ["date_v1", "date_v2", "brief_v2"]) {
      expect(trace.events[4].reads[role].allowed).toBe(false);
    }
    expect(html()).not.toMatch(/<script[^>]+src=|<iframe|__RECORDED_TRACE__/);
  });

  it.each(["fr", "en"])(
    "lets a visitor inspect every exact observation in %s without losing focus",
    async (locale) => {
      const trace = recording();
      const dom = new JSDOM(html(), {
        runScripts: "dangerously",
        url: `https://demo.invalid/?lang=${locale}&step=1&campaign=portfolio#evidence`,
        beforeParse(window) {
          window.HTMLElement.prototype.scrollIntoView = () => {};
          if (locale === "en") {
            Object.defineProperty(window.navigator, "clipboard", {
              value: {
                writeText: async () => {
                  throw new Error("Clipboard access denied");
                },
              },
            });
          }
        },
      });
      try {
        const document = dom.window.document;
        const text = (id: string) => document.getElementById(id)!.textContent;
        const click = (id: string) =>
          (document.getElementById(id) as HTMLButtonElement).click();
        expect(document.getElementById("previous")).toHaveProperty(
          "disabled",
          true,
        );
        expect(document.querySelectorAll("[data-step]")).toHaveLength(5);
        expect(document.querySelectorAll("#recording-mode")).toHaveLength(1);
        for (let index = 0; index < trace.events.length; index++) {
          if (index) click("next");
          const event = trace.events[index];
          const read = event.reads[primaryRoles[index]];
          expect(document.getElementById("status")).toHaveAttribute(
            "data-phase",
            event.phase,
          );
          expect(text("answer")).toBe(
            read.allowed
              ? read.content
              : locale === "fr"
                ? "Aucune preuve admissible"
                : "No admissible evidence",
          );
          expect(JSON.parse(text("machine")!)).toEqual({
            operations: event.operations,
            reads: event.reads,
            details: event.details,
          });
          expect(JSON.parse(text("references")!)).toEqual({
            refs: event.refs,
            provenance: event.provenance,
          });
          expect(
            document.querySelector(`[data-step="${index}"]`),
          ).toHaveAttribute("aria-current", "step");
          expect(document.getElementById("node-date")).toHaveAttribute(
            "data-artifact",
            "atlas-deadline",
          );
          expect(document.getElementById("node-language")).toHaveAttribute(
            "data-state",
            "available",
          );
          expect(document.getElementById("node-brief")).toHaveAttribute(
            "data-state",
            index === 0 ? "absent" : index < 3 ? "available" : "blocked",
          );
          for (const source of ["date", "language"]) {
            expect(document.getElementById(`edge-${source}`)).toHaveAttribute(
              "data-linked",
              String(index !== 0),
            );
          }
          expect(document.getElementById("restore-authority")).toHaveProperty(
            "hidden",
            index !== 4,
          );
          expect(
            new URL(dom.window.location.href).searchParams.get("step"),
          ).toBe(String(index + 1));
        }
        expect(document.getElementById("next")).toHaveProperty(
          "disabled",
          true,
        );
        click("previous");
        expect(document.getElementById("status")).toHaveAttribute(
          "data-phase",
          "revoke",
        );
        const step = document.querySelector('[data-step="2"]') as HTMLElement;
        step.focus();
        step.click();
        expect(document.activeElement).toBe(step);
        expect(text("answer")).toBe(trace.events[2].reads.brief_v2.content);
        const node = document.getElementById("node-language")!;
        node.focus();
        node.click();
        expect(document.activeElement).toBe(node);
        expect(document.querySelectorAll("details.technical")).toHaveLength(1);
        expect(document.getElementById("technical")).toHaveProperty(
          "open",
          true,
        );
        expect(JSON.parse(text("inspector-read")!).read).toEqual(
          trace.events[2].reads.control,
        );
        click("language");
        expect(document.documentElement.lang).toBe(
          locale === "fr" ? "en" : "fr",
        );
        expect(document.getElementById("status")).toHaveAttribute(
          "data-phase",
          "correct",
        );
        expect(text("answer")).toBe(trace.events[2].reads.brief_v2.content);
        expect(document.querySelector('[data-step="2"]')).toBe(step);
        expect(document.getElementById("back")).toHaveAttribute(
          "href",
          locale === "fr"
            ? "/work/persistent-memory/"
            : "/fr/realisations/persistent-memory/",
        );
        const shared = new URL(dom.window.location.href);
        expect(shared.searchParams.get("step")).toBe("3");
        expect(shared.searchParams.get("lang")).toBe(
          locale === "fr" ? "en" : "fr",
        );
        expect(shared.searchParams.get("campaign")).toBe("portfolio");
        expect(shared.hash).toBe("#evidence");
        click("share");
        await waitFor(
          () => {
            expect(document.getElementById("share-link")).toHaveProperty(
              "hidden",
              false,
            );
            expect(document.getElementById("share-link")).toHaveProperty(
              "value",
              shared.href,
            );
          },
          { timeout: 1000 },
        );
        click("restart");
        expect(document.getElementById("status")).toHaveAttribute(
          "data-phase",
          "admit",
        );
        expect(document.getElementById("previous")).toHaveProperty(
          "disabled",
          true,
        );
      } finally {
        dom.window.close();
      }
      for (const step of ["3", "5", "0", "6", "NaN", "2.5", "3x", "-1"]) {
        const initial = new JSDOM(html(), {
          runScripts: "dangerously",
          url: `https://demo.invalid/?lang=${locale}&step=${step}`,
        });
        try {
          const phase =
            step === "3" ? "correct" : step === "5" ? "restore" : "admit";
          expect(
            initial.window.document.getElementById("status"),
          ).toHaveAttribute("data-phase", phase);
        } finally {
          initial.window.close();
        }
      }
    },
  );

  it("displays supplied evidence as text and refuses an unverified recording", () => {
    const original = html();
    const trace = recording();
    const evidence =
      '<img src="https://unexpected.invalid/" onerror="alert(1)">';
    trace.events[0].reads.date_v1.content = evidence;
    const dom = new JSDOM(
      original.replace(embeddedTrace(original), JSON.stringify(trace)),
      { runScripts: "dangerously", url: "https://demo.invalid/?lang=en" },
    );
    try {
      expect(dom.window.document.getElementById("answer")!.textContent).toBe(
        evidence,
      );
      expect(dom.window.document.querySelectorAll("img")).toHaveLength(0);
    } finally {
      dom.window.close();
    }
    trace.assertions = { verified: false };
    const unavailable = new JSDOM(
      original.replace(embeddedTrace(original), JSON.stringify(trace)),
      { runScripts: "dangerously", url: "https://demo.invalid/?lang=en" },
    );
    try {
      expect(unavailable.window.document.getElementById("demo")).toHaveProperty(
        "hidden",
        true,
      );
      expect(
        unavailable.window.document.getElementById("unavailable")!.textContent,
      ).toContain("No result is simulated");
    } finally {
      unavailable.window.close();
    }
    const withoutDependencies = recording();
    withoutDependencies.events[1].provenance.nodes[0].dependencies = [];
    const unlinked = new JSDOM(
      original.replace(
        embeddedTrace(original),
        JSON.stringify(withoutDependencies),
      ),
      {
        runScripts: "dangerously",
        url: "https://demo.invalid/?lang=en&step=2",
      },
    );
    try {
      for (const source of ["date", "language"]) {
        expect(
          unlinked.window.document.getElementById(`edge-${source}`),
        ).toHaveAttribute("data-linked", "false");
      }
    } finally {
      unlinked.window.close();
    }
    const mismatchedVersion = recording();
    mismatchedVersion.events[1].provenance.nodes[0].dependencies[0].ref.version_id =
      "not-the-recorded-date-version";
    const mismatched = new JSDOM(
      original.replace(
        embeddedTrace(original),
        JSON.stringify(mismatchedVersion),
      ),
      {
        runScripts: "dangerously",
        url: "https://demo.invalid/?lang=en&step=2",
      },
    );
    try {
      expect(
        mismatched.window.document.getElementById("edge-date"),
      ).toHaveAttribute("data-linked", "false");
      expect(
        mismatched.window.document.getElementById("edge-language"),
      ).toHaveAttribute("data-linked", "true");
    } finally {
      mismatched.window.close();
    }
    const withoutCurrentAuthority = recording();
    withoutCurrentAuthority.events[4].details.retained_current_authority = false;
    const unretained = new JSDOM(
      original.replace(
        embeddedTrace(original),
        JSON.stringify(withoutCurrentAuthority),
      ),
      {
        runScripts: "dangerously",
        url: "https://demo.invalid/?lang=en&step=5",
      },
    );
    try {
      expect(
        unretained.window.document.getElementById("restore-authority")!
          .textContent,
      ).toBe("");
    } finally {
      unretained.window.close();
    }
  });
});
