import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { test } from "node:test";

const dist = new URL("../../dist/", import.meta.url);
const read = (name) => readFile(new URL(name, dist), "utf8");

test("sitemap gives every page a W3C lastmod date from the manifest", async () => {
  const sitemap = await read("sitemap.xml");
  const manifest = JSON.parse(
    await readFile(new URL("../../scripts/page-dates.json", import.meta.url)),
  );
  const entries = [
    ...sitemap.matchAll(
      /<url><loc>https:\/\/musyg\.com([^<]+)<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod><\/url>/g,
    ),
  ];
  assert.ok(entries.length > 0);
  assert.equal(entries.length, (sitemap.match(/<url>/g) ?? []).length);
  for (const [, path, lastmod] of entries)
    assert.equal(manifest[path]?.lastmod, lastmod, path);
});

test("llms.txt indexes every English page and stays within content rules", async () => {
  const llms = await read("llms.txt");
  const sitemap = await read("sitemap.xml");
  assert.match(llms, /^# Gilles Musy \(Musyg\)\n\n> \S/u);
  const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const url of pages) assert.ok(llms.includes(`](${url})`), url);
  assert.ok(llms.includes("](https://github.com/Musyg)"));
  assert.doesNotMatch(llms, /\u2014|undefined|\[object/u);
});

test("IndexNow key file holds its own key", async () => {
  const keyFiles = (await readdir(dist)).filter((name) =>
    /^[a-f0-9]{32}\.txt$/u.test(name),
  );
  assert.equal(keyFiles.length, 1);
  assert.equal(await read(keyFiles[0]), keyFiles[0].slice(0, -4));
});
