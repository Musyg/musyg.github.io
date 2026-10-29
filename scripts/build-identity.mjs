import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

export async function buildIdentity(root) {
  const files = [
    "index.html",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "vite.config.ts",
  ];
  async function visit(relative) {
    const directory = join(root, relative);
    for (const name of (await readdir(directory)).sort()) {
      if (name.startsWith(".") && name !== ".htaccess") continue;
      const path = `${relative}/${name}`;
      const stat = await lstat(join(root, path));
      if (stat.isSymbolicLink())
        throw new Error("Build identity rejects symlinks");
      if (stat.isDirectory()) await visit(path);
      else if (stat.isFile()) files.push(path);
      else throw new Error("Build identity requires regular files");
    }
  }
  for (const directory of ["src", "server", "scripts", "public"])
    await visit(directory);
  const hash = createHash("sha256");
  for (const path of files.sort()) {
    hash
      .update(path)
      .update("\0")
      .update(await readFile(join(root, path)))
      .update("\0");
  }
  const dates = JSON.parse(
    await readFile(join(root, "scripts/page-dates.json"), "utf8"),
  );
  return {
    schema: 1,
    source_sha256: hash.digest("hex"),
    routes: Object.keys(dates).length,
  };
}
