import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { portfolioServer } from "../../server/http.mjs";

test("HTTP serves prerendered routes and protects API boundaries", async (t) => {
  const calls = [];
  const server = await portfolioServer({
    dist: fileURLToPath(new URL("../../dist/", import.meta.url)),
    contact: {
      publicConfig: () => ({ enabled: false }),
      submit: async (input) => {
        calls.push(input);
        return { status: 202, code: "accepted" };
      },
    },
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  );
  const base = `http://127.0.0.1:${server.address().port}`;
  const sitemap = await readFile(
    new URL("../../dist/sitemap.xml", import.meta.url),
    "utf8",
  );
  const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname,
  );
  assert.equal(routes.length, 30);
  for (const path of routes) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.deepEqual(
      Buffer.from(await response.arrayBuffer()),
      await readFile(new URL(`../../dist${path}index.html`, import.meta.url)),
      path,
    );
  }
  for (const path of [
    "/",
    "/fr/",
    "/fr/contact/",
    "/work/celo-credentials/",
    "/fr/realisations/pedi-sense/?source=test",
  ])
    assert.equal((await fetch(base + path)).status, 200, path);
  for (const path of [
    "/.env",
    "/server/index.mjs",
    "/package.json",
    "/.htaccess",
    "/not-a-route/",
    "/%2e%2e/package.json",
  ])
    assert.equal((await fetch(base + path)).status, 404, path);
  const config = await fetch(base + "/api/contact/config");
  assert.equal(config.headers.get("cache-control"), "no-store");
  assert.deepEqual(await config.json(), { enabled: false });
  assert.equal((await fetch(base + "/api/contact")).status, 405);
  assert.equal(
    (await fetch(base + "/api/contact", { method: "POST", body: "plain" }))
      .status,
    415,
  );
  assert.equal(
    (
      await fetch(base + "/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await fetch(base + "/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "x".repeat(32769),
      })
    ).status,
    413,
  );
  const sent = await fetch(base + "/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://musyg.com",
      "X-Forwarded-For": "spoofed",
      "CF-Connecting-IP": "spoofed",
    },
    body: "{}",
  });
  assert.equal(sent.status, 202);
  assert.notEqual(calls[0].peer, "spoofed");
  assert.equal(calls.length, 1);
  const redirect = await fetch(base + "/fr/contact?q=one", {
    redirect: "manual",
  });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get("location"), "/fr/contact/?q=one");
});
