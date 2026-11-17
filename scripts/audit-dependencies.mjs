// Dependency audit gate for every build and deployment.
//
// Runs `npm audit` on all dependencies, development ones included, and fails
// on any advisory of any severity, like `npm audit --audit-level=low`, except
// an advisory listed below whose expiry date has not passed. An entry that has
// expired fails the audit even if the advisory is gone, so the list cannot
// grow stale; an entry whose advisory no longer appears is reported so it can
// be removed.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const exceptions = [
  {
    id: "GHSA-fc5q-39xc-vjpf",
    package: "picomatch",
    expires: "2026-12-17",
    reason:
      "ReDoS on crafted extglob patterns. Every published picomatch version is affected and no fix exists yet. picomatch is only used at build time by vite and vitest with patterns from this repository; the deployed server ships Nodemailer only.",
  },
];

function advisoryId(advisory) {
  const match = /GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}/.exec(
    advisory.url ?? "",
  );
  return match ? match[0] : `npm-${advisory.source}`;
}

// Returns { failures, allowed, unused } for a parsed `npm audit --json` report.
export function evaluateAudit(report, list, today) {
  const failures = [];
  if (!report || typeof report !== "object" || report.error) {
    failures.push(
      `npm audit did not produce a report: ${JSON.stringify(report?.error ?? report)}`,
    );
    return { failures, allowed: [], unused: [] };
  }
  if (!report.vulnerabilities || typeof report.vulnerabilities !== "object") {
    failures.push("npm audit report has no vulnerabilities section");
    return { failures, allowed: [], unused: [] };
  }
  const advisories = new Map();
  for (const entry of Object.values(report.vulnerabilities)) {
    for (const via of entry.via ?? []) {
      if (via && typeof via === "object") advisories.set(advisoryId(via), via);
    }
  }
  const active = new Map();
  for (const exception of list) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(exception.expires)) {
      failures.push(
        `${exception.id}: invalid expiry date ${exception.expires}`,
      );
    } else if (today > exception.expires) {
      failures.push(
        `${exception.id}: exception expired on ${exception.expires}; remove it or review it again`,
      );
    } else {
      active.set(exception.id, exception);
    }
  }
  const allowed = [];
  for (const [id, advisory] of advisories) {
    const exception = active.get(id);
    if (exception && exception.package === advisory.name) {
      allowed.push(`${id} (${advisory.name}, until ${exception.expires})`);
    } else {
      failures.push(
        `${id} ${advisory.name} ${advisory.severity}: ${advisory.title}`,
      );
    }
  }
  const unused = [...active.keys()].filter((id) => !advisories.has(id));
  return { failures, allowed, unused };
}

function main() {
  const result = spawnSync("npm", ["audit", "--json", "--include=dev"], {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 64 * 1024 * 1024,
  });
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    report = { error: result.stderr || "unparseable npm audit output" };
  }
  const today = new Date().toISOString().slice(0, 10);
  const { failures, allowed, unused } = evaluateAudit(
    report,
    exceptions,
    today,
  );
  for (const line of allowed) console.log(`allowed by exception: ${line}`);
  for (const id of unused)
    console.log(`exception no longer needed, remove it: ${id}`);
  if (failures.length) {
    for (const line of failures) console.error(`audit failure: ${line}`);
    process.exit(1);
  }
  console.log("Dependency audit passed.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
