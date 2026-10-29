import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { buildIdentity } from "../../scripts/build-identity.mjs";

test("both publication payloads identify the same 34-route source", async () => {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const expected = await buildIdentity(root);
  assert.deepEqual(Object.keys(expected), [
    "schema",
    "source_sha256",
    "routes",
  ]);
  assert.equal(expected.routes, 34);
  assert.match(expected.source_sha256, /^[a-f0-9]{64}$/);
  const pages = await readFile(join(root, "dist/build-info.json"), "utf8");
  assert.deepEqual(JSON.parse(pages), expected);
  assert.equal(
    await readFile(join(root, "release/dist/build-info.json"), "utf8"),
    pages,
  );
});

test("identity follows application changes and ignores environment files", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "musyg-build-identity-"));
  try {
    for (const directory of ["src", "server", "scripts", "public"])
      await mkdir(join(temporary, directory));
    for (const name of [
      "index.html",
      "package.json",
      "package-lock.json",
      "tsconfig.json",
      "tsconfig.app.json",
      "tsconfig.node.json",
      "vite.config.ts",
    ])
      await writeFile(join(temporary, name), "{}\n");
    await writeFile(join(temporary, "src/app.ts"), "export const value = 1;\n");
    await writeFile(join(temporary, "scripts/page-dates.json"), '{"/":{}}\n');
    const first = await buildIdentity(temporary);
    await writeFile(join(temporary, ".env"), "ignored\n");
    await writeFile(join(temporary, "public/.env"), "ignored\n");
    assert.deepEqual(await buildIdentity(temporary), first);
    await writeFile(join(temporary, "src/app.ts"), "export const value = 2;\n");
    assert.notEqual(
      (await buildIdentity(temporary)).source_sha256,
      first.source_sha256,
    );
  } finally {
    const within = relative(resolve(tmpdir()), resolve(temporary));
    assert.ok(within && !within.startsWith("..") && !isAbsolute(within));
    assert.ok(temporary.includes("musyg-build-identity-"));
    await rm(temporary, { recursive: true });
  }
});
