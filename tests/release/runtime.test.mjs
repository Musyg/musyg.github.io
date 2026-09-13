import test from "node:test";
import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout } from "node:timers/promises";

test("isolated release starts with only bundled runtime and contact disabled", async () => {
  const source = fileURLToPath(new URL("../../release/", import.meta.url));
  const temporary = await mkdtemp(join(tmpdir(), "musyg-release-test-"));
  let child;
  try {
    await cp(source, temporary, { recursive: true });
    assert.deepEqual((await readdir(temporary)).sort(), [
      ".generated-release",
      "dist",
      "node_modules",
      "package.json",
      "server",
    ]);
    assert.deepEqual(await readdir(join(temporary, "node_modules")), [
      "nodemailer",
    ]);
    const allocator = createServer();
    await new Promise((resolve) => allocator.listen(0, "127.0.0.1", resolve));
    const port = allocator.address().port;
    await new Promise((resolve) => allocator.close(resolve));
    // No inherited SMTP, Turnstile, NODE_PATH or preload environment.
    child = spawn(process.execPath, [join(temporary, "server/index.mjs")], {
      cwd: temporary,
      env: {
        SystemRoot: process.env.SystemRoot ?? "",
        PATH: process.env.PATH ?? "",
        HOST: "127.0.0.1",
        PORT: String(port),
        CONTACT_ENABLED: "false",
      },
      stdio: "ignore",
    });
    const base = `http://127.0.0.1:${port}`;
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null) throw new Error("Packaged server exited");
      try {
        const response = await fetch(base + "/api/contact/config");
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { enabled: false });
        ready = true;
        break;
      } catch {
        await setTimeout(100);
      }
    }
    assert.equal(ready, true, "Server started without repository dependencies");
    const sitemap = await readFile(join(temporary, "dist/sitemap.xml"), "utf8");
    const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    );
    assert.equal(routes.length, 28);
    for (const route of routes) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200, route);
      assert.deepEqual(
        Buffer.from(await response.arrayBuffer()),
        await readFile(join(temporary, "dist", route, "index.html")),
        route,
      );
    }
    for (const route of [
      "/.env",
      "/package.json",
      "/server/index.mjs",
      "/node_modules/nodemailer/package.json",
      "/missing-page/",
    ])
      assert.equal((await fetch(base + route)).status, 404, route);
  } finally {
    if (child && child.exitCode === null) {
      const stopped = new Promise((resolve) => child.once("exit", resolve));
      child.kill();
      await stopped;
    }
    await rm(temporary, { recursive: true, force: true });
  }
});
