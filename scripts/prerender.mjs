import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  render,
  routePaths,
  routeAliases,
  routeIndex,
  profileLinks,
} from "../dist-ssr/entry-server.js";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const distributionDirectory = join(repositoryRoot, "dist");
const templatePath = join(distributionDirectory, "index.html");
const template = await readFile(templatePath, "utf8");

if (
  !template.includes("<!--app-head-->") ||
  !template.includes("<!--app-html-->")
) {
  throw new Error(
    "Prerender placeholders are missing from the client template",
  );
}

// Content fingerprint per route: rendered markup and metadata only, so asset
// hashes from an unrelated code change do not move a page's lastmod date.
const pageHashes = new Map();

async function writeRoute(pathname) {
  const { html, head, lang } = render(pathname);
  pageHashes.set(
    pathname,
    createHash("sha256").update(head).update(html).digest("hex").slice(0, 16),
  );
  const document = template
    .replace('<html lang="en">', `<html lang="${lang}">`)
    .replace("<!--app-head-->", head)
    .replace("<!--app-html-->", html);
  const outputPath =
    pathname === "/"
      ? join(distributionDirectory, "index.html")
      : join(distributionDirectory, pathname.replace(/^\//, ""), "index.html");

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, document);
}

for (const pathname of routePaths) {
  await writeRoute(pathname);
}

// Legacy links remain usable without appearing in the sitemap or new navigation.
for (const [legacy, target] of Object.entries(routeAliases)) {
  const outputPath = join(distributionDirectory, legacy.slice(1), "index.html");
  const document = `<!doctype html><html lang="${target.startsWith("/fr/") ? "fr" : "en"}"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="https://musyg.com${target}"><meta name="robots" content="noindex"><title>Persistent Memory</title><style>html{background:#0f1216;color:#f1f5f9}a{color:#005EFF}</style></head><body><a href="${target}">Persistent Memory</a></body></html>`;
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, document);
}
await writeFile(
  join(distributionDirectory, "route-redirects.json"),
  JSON.stringify(routeAliases),
);

const notFound = render("/404/");
const notFoundDocument = template
  .replace("<!--app-head-->", notFound.head)
  .replace("<!--app-html-->", notFound.html);
await writeFile(join(distributionDirectory, "404.html"), notFoundDocument);

const siteOrigin = "https://musyg.com";

// lastmod dates are kept in a tracked manifest. A page keeps its recorded date
// while its fingerprint is unchanged; a changed or new page takes the build
// date. Commit scripts/page-dates.json together with content changes.
const pageDatesPath = join(repositoryRoot, "scripts", "page-dates.json");
let recordedDates = {};
try {
  recordedDates = JSON.parse(await readFile(pageDatesPath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const buildDate = new Date().toISOString().slice(0, 10);
const pageDates = {};
for (const pathname of routePaths) {
  const hash = pageHashes.get(pathname);
  const recorded = recordedDates[pathname];
  pageDates[pathname] =
    recorded?.hash === hash ? recorded : { hash, lastmod: buildDate };
}
const pageDatesJson = `${JSON.stringify(pageDates, null, 2)}\n`;
if (pageDatesJson !== JSON.stringify(recordedDates, null, 2) + "\n")
  await writeFile(pageDatesPath, pageDatesJson);

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routePaths.map(
    (pathname) =>
      `  <url><loc>${new URL(pathname, siteOrigin)}</loc><lastmod>${pageDates[pathname].lastmod}</lastmod></url>`,
  ),
  "</urlset>",
  "",
].join("\n");

await writeFile(join(distributionDirectory, "sitemap.xml"), sitemap);
await writeFile(
  join(distributionDirectory, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`,
);

// llms.txt (https://llmstxt.org): a Markdown index of the site for language
// models, generated from the same route metadata as the pages themselves.
const shortTitle = (title) =>
  title.replace(/^Gilles Musy \| /u, "").replace(/ \| Gilles Musy$/u, "");
const link = (route) =>
  `- [${shortTitle(route.title)}](${new URL(route.path, siteOrigin)}): ${route.description}`;
const english = routeIndex.filter((route) => route.locale === "en");
const home = english.find((route) => route.kind === "home");
const sections = [
  ["Overview", ["home"]],
  ["Expertise", ["practice"]],
  ["Work", ["work", "project"]],
  ["Writing", ["writing", "article"]],
  ["About and contact", ["about", "contact"]],
];
const llms = [
  "# Gilles Musy (Musyg)",
  "",
  `> ${home.description}`,
  "",
  "Every page is published in English and French. French pages live under /fr/ and are listed at the end.",
  "",
  ...sections.flatMap(([heading, kinds]) => [
    `## ${heading}`,
    "",
    ...english.filter((route) => kinds.includes(route.kind)).map(link),
    "",
  ]),
  "## Professional profiles",
  "",
  ...profileLinks.map(
    (profile) => `- [${profile.name} (${profile.handle})](${profile.url})`,
  ),
  "",
  "## Optional",
  "",
  ...routeIndex
    .filter((route) => route.locale === "fr")
    .map(
      (route) =>
        `- [${shortTitle(route.title)}](${new URL(route.path, siteOrigin)})`,
    ),
  "",
].join("\n");
await writeFile(join(distributionDirectory, "llms.txt"), llms);
