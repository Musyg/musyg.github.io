import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render, routePaths, routeAliases } from "../dist-ssr/entry-server.js";

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

async function writeRoute(pathname) {
  const { html, head, lang } = render(pathname);
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
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routePaths.map(
    (pathname) => `  <url><loc>${new URL(pathname, siteOrigin)}</loc></url>`,
  ),
  "</urlset>",
  "",
].join("\n");

await writeFile(join(distributionDirectory, "sitemap.xml"), sitemap);
await writeFile(
  join(distributionDirectory, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`,
);
