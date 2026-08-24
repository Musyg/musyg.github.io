import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render, routePaths } from "../dist-ssr/entry-server.js";

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

const notFound = render("/404/");
const notFoundDocument = template
  .replace("<!--app-head-->", notFound.head)
  .replace("<!--app-html-->", notFound.html);
await writeFile(join(distributionDirectory, "404.html"), notFoundDocument);

const siteOrigin = "https://musyg.github.io";
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
