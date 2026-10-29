// Notify IndexNow (Bing, Yandex, Seznam, Naver...) about changed pages.
//
// Usage:
//   node scripts/indexnow.mjs --since <git-ref> [--wait] [--dry-run]
//   node scripts/indexnow.mjs [--wait] [--dry-run] /path/ /other/path/
//
// --since compares scripts/page-dates.json with its version at <git-ref> and
// submits only pages whose fingerprint changed or that are new.
// --wait polls the live sitemap until every submitted page shows its new
// lastmod, so the ping is sent after the production deployment, not before.
// Only Node built-ins are used, so no install step is needed.

import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const host = "musyg.com";
const origin = `https://${host}`;
const endpoint = "https://api.indexnow.org/indexnow";
const root = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = "scripts/page-dates.json";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const sinceIndex = args.indexOf("--since");
const since = sinceIndex >= 0 ? (args[sinceIndex + 1] ?? "") : null;
const explicit = args.filter(
  (value, index) =>
    value.startsWith("/") && (sinceIndex < 0 || index !== sinceIndex + 1),
);

const keyFile = (await readdir(join(root, "public"))).find((name) =>
  /^[a-f0-9]{32}\.txt$/u.test(name),
);
if (!keyFile) throw new Error("IndexNow key file is missing from public/");
const key = keyFile.slice(0, -4);
const keyLocation = `${origin}/${keyFile}`;

const current = JSON.parse(await readFile(join(root, manifestPath), "utf8"));

function previousManifest(ref) {
  if (!ref || /^0+$/u.test(ref)) return {};
  try {
    return JSON.parse(
      execFileSync("git", ["show", `${ref}:${manifestPath}`], {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }),
    );
  } catch {
    return {};
  }
}

let paths = explicit;
// An empty ref (manual run, new branch) submits every page.
if (since !== null) {
  const previous = previousManifest(since);
  paths = Object.keys(current).filter(
    (path) => previous[path]?.hash !== current[path].hash,
  );
}
paths = paths.filter((path) => current[path]);

if (paths.length === 0) {
  console.log("IndexNow: no changed pages to submit.");
  process.exit(0);
}

const urlList = paths.map((path) => new URL(path, origin).toString());
console.log(`IndexNow: ${urlList.length} page(s)\n${urlList.join("\n")}`);

if (flag("--wait")) {
  const deadline = Date.now() + 15 * 60 * 1000;
  for (;;) {
    let live = "";
    try {
      const response = await fetch(`${origin}/sitemap.xml?t=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (response.ok) live = await response.text();
    } catch {
      // Network hiccup during deployment: retry until the deadline.
    }
    const ready = paths.every((path) =>
      live.includes(
        `<loc>${new URL(path, origin)}</loc><lastmod>${current[path].lastmod}</lastmod>`,
      ),
    );
    if (ready) break;
    if (Date.now() > deadline)
      throw new Error("Live sitemap did not reflect this build within 15 min");
    console.log("Waiting for the deployment to go live...");
    await new Promise((resolve) => setTimeout(resolve, 20_000));
  }
}

if (flag("--dry-run")) {
  console.log("Dry run: nothing submitted.");
  process.exit(0);
}

const liveKey = await fetch(keyLocation).then((response) =>
  response.ok ? response.text() : "",
);
if (liveKey.trim() !== key)
  throw new Error(`Key file is not served at ${keyLocation}`);

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});
console.log(`IndexNow response: ${response.status}`);
// 200 = accepted, 202 = accepted and key validation pending.
if (![200, 202].includes(response.status)) process.exit(1);
