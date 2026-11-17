import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateAudit,
  exceptions,
} from "../../scripts/audit-dependencies.mjs";

const advisory = (id, name, severity = "high") => ({
  source: 1,
  name,
  severity,
  title: `${name} advisory`,
  url: `https://github.com/advisories/${id}`,
});

const report = (...advisories) => ({
  vulnerabilities: Object.fromEntries(
    advisories.map((item) => [
      item.name,
      { name: item.name, via: [item, "other-package"] },
    ]),
  ),
});

const picomatch = advisory("GHSA-fc5q-39xc-vjpf", "picomatch");

test("an advisory covered by an unexpired exception passes", () => {
  const result = evaluateAudit(report(picomatch), exceptions, "2026-11-17");
  assert.deepEqual(result.failures, []);
  assert.equal(result.allowed.length, 1);
});

test("the exception stops working after its expiry date", () => {
  const result = evaluateAudit(report(picomatch), exceptions, "2026-12-18");
  assert.equal(result.failures.length, 2);
  assert.match(result.failures[0], /expired on 2026-12-17/);
  assert.match(result.failures[1], /GHSA-fc5q-39xc-vjpf picomatch/);
});

test("an expired exception fails even once the advisory is gone", () => {
  const result = evaluateAudit(report(), exceptions, "2026-12-18");
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /expired/);
});

test("any other advisory fails, whatever its severity", () => {
  const other = advisory("GHSA-aaaa-bbbb-cccc", "left-pad", "low");
  const result = evaluateAudit(
    report(picomatch, other),
    exceptions,
    "2026-11-17",
  );
  assert.deepEqual(result.failures, [
    "GHSA-aaaa-bbbb-cccc left-pad low: left-pad advisory",
  ]);
});

test("an exception does not cover the same advisory in another package", () => {
  const moved = advisory("GHSA-fc5q-39xc-vjpf", "micromatch");
  const result = evaluateAudit(report(moved), exceptions, "2026-11-17");
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /micromatch/);
});

test("a missing or failed report fails closed", () => {
  for (const broken of [
    null,
    { error: { code: "ENOTFOUND" } },
    { metadata: {} },
  ]) {
    assert.equal(
      evaluateAudit(broken, exceptions, "2026-11-17").failures.length,
      1,
    );
  }
});

test("an exception whose advisory disappeared is reported as unused", () => {
  const result = evaluateAudit(report(), exceptions, "2026-11-17");
  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.unused, ["GHSA-fc5q-39xc-vjpf"]);
});
