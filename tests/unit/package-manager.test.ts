import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("npm build contract", () => {
  it("uses one npm lockfile with the unchanged manifest ranges", () => {
    const manifest = JSON.parse(readFileSync("package.json", "utf8"));
    const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
    expect(manifest.packageManager).toBe("npm@11.6.0");
    expect(existsSync("pnpm-lock.yaml")).toBe(false);
    expect(existsSync("yarn.lock")).toBe(false);
    expect(lock.lockfileVersion).toBe(3);
    expect(lock.packages[""].dependencies).toEqual(manifest.dependencies);
    expect(lock.packages[""].devDependencies).toEqual(manifest.devDependencies);
    expect(JSON.stringify(manifest.scripts)).not.toMatch(/\bpnpm\b/);
    expect(manifest.scripts.build).toContain("npm run prerender");
  });

  it("runs CI and browser previews through npm", () => {
    for (const name of ["quality", "deploy-pages"]) {
      const workflow = readFileSync(`.github/workflows/${name}.yml`, "utf8");
      expect(workflow).toContain("npm install --global npm@11.6.0");
      expect(workflow).toContain("cache: npm");
      expect(workflow).toContain("npm ci");
      expect(workflow).toContain("npm run verify");
      expect(workflow).not.toMatch(/\bpnpm\b/);
    }
    const preview = readFileSync("playwright.config.ts", "utf8");
    expect(preview).toContain("npm run preview -- --port 4173");
    expect(preview).not.toMatch(/\bpnpm\b/);
  });
});
