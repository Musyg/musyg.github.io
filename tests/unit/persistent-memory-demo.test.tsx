import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { render, screen } from "@testing-library/react";
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
    (locale) => {
      const trace = recording();
      const dom = new JSDOM(html(), {
        runScripts: "dangerously",
        url: `https://demo.invalid/?lang=${locale}`,
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
        for (let index = 0; index < trace.events.length; index++) {
          if (index) click("next");
          const event = trace.events[index];
          const read = event.reads[primaryRoles[index]];
          expect(text("status")).toBe(event.phase.toUpperCase());
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
        }
        expect(document.getElementById("next")).toHaveProperty(
          "disabled",
          true,
        );
        click("previous");
        expect(text("status")).toBe("REVOKE");
        const step = document.querySelector('[data-step="2"]') as HTMLElement;
        step.focus();
        step.click();
        expect(document.activeElement).toBe(step);
        expect(text("answer")).toBe(trace.events[2].reads.brief_v2.content);
        click("language");
        expect(document.documentElement.lang).toBe(
          locale === "fr" ? "en" : "fr",
        );
        expect(text("status")).toBe("CORRECT");
        expect(text("answer")).toBe(trace.events[2].reads.brief_v2.content);
        expect(document.querySelector('[data-step="2"]')).toBe(step);
        expect(document.getElementById("back")).toHaveAttribute(
          "href",
          locale === "fr"
            ? "/work/persistent-memory/"
            : "/fr/realisations/persistent-memory/",
        );
        click("restart");
        expect(text("status")).toBe("ADMIT");
        expect(document.getElementById("previous")).toHaveProperty(
          "disabled",
          true,
        );
      } finally {
        dom.window.close();
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
  });
});
