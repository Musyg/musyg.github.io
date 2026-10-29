import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const script = fileURLToPath(
  new URL("../../scripts/sync-hostinger.mjs", import.meta.url),
);
const environment = {
  PATH: process.env.PATH,
  SystemRoot: process.env.SystemRoot ?? "",
  TEMP: tmpdir(),
  TMP: tmpdir(),
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_GLOBAL: process.platform === "win32" ? "NUL" : "/dev/null",
  GIT_TERMINAL_PROMPT: "0",
  GITHUB_ACTIONS: "true",
  GITHUB_REPOSITORY: "Musyg/musyg.github.io",
  GITHUB_REF: "refs/heads/main",
};

async function fixture(run, { branch = true } = {}) {
  const temporary = await mkdtemp(join(tmpdir(), "musyg-deploy-sync-"));
  const origin = join(temporary, "origin.git");
  const checkout = join(temporary, "checkout");
  const git = (...args) =>
    execFileSync("git", args, {
      cwd: checkout,
      env: environment,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  try {
    await mkdir(checkout);
    git("init", "--bare", origin);
    git("init", "-b", "main");
    git("config", "user.name", "Deployment test");
    git("config", "user.email", "deployment@example.invalid");
    git("remote", "add", "origin", origin);
    await writeFile(join(checkout, "site.txt"), "initial\n");
    git("add", "site.txt");
    git("commit", "-m", "Initial site");
    const initial = git("rev-parse", "HEAD");
    git("push", "origin", "main");
    if (branch)
      git("push", "origin", "HEAD:refs/heads/feature/contact-protected");
    await writeFile(join(checkout, "site.txt"), "validated update\n");
    git("commit", "-am", "Validated update");
    const target = git("rev-parse", "HEAD");
    const invoke = (sha = target, env = {}) =>
      spawnSync(process.execPath, [script, sha], {
        cwd: checkout,
        env: { ...environment, ...env },
        encoding: "utf8",
      });
    const remote = () =>
      git("ls-remote", "origin", "refs/heads/feature/contact-protected").split(
        /\s/,
      )[0];
    await run({ git, initial, target, invoke, remote, checkout });
  } finally {
    const within = relative(resolve(tmpdir()), resolve(temporary));
    assert.ok(within && !within.startsWith("..") && !isAbsolute(within));
    assert.ok(temporary.includes("musyg-deploy-sync-"));
    await rm(temporary, { recursive: true });
  }
}

test("advances only the Hostinger branch to the validated descendant", () =>
  fixture(async ({ initial, target, invoke, remote, git }) => {
    assert.equal(remote(), initial);
    assert.equal(invoke().status, 0);
    assert.equal(remote(), target);
    assert.equal(
      git("ls-remote", "origin", "refs/heads/main").split(/\s/)[0],
      initial,
    );
  }));

test("repeating a completed synchronization creates no commit", () =>
  fixture(async ({ target, invoke, remote }) => {
    assert.equal(invoke().status, 0);
    assert.equal(invoke().status, 0);
    assert.equal(remote(), target);
  }));

test("preserves independent production work and refuses divergence", () =>
  fixture(async ({ git, initial, target, invoke, remote, checkout }) => {
    git("switch", "-c", "independent-production", initial);
    await writeFile(join(checkout, "production.txt"), "independent work\n");
    git("add", "production.txt");
    git("commit", "-m", "Independent production work");
    const independent = git("rev-parse", "HEAD");
    git("push", "origin", "HEAD:refs/heads/feature/contact-protected");
    git("switch", "main");
    assert.notEqual(invoke(target).status, 0);
    assert.equal(remote(), independent);
    assert.equal(
      git("show", `${independent}:production.txt`),
      "independent work",
    );
  }));

test("refuses a target other than the checked-out revision", () =>
  fixture(async ({ initial, invoke, remote }) => {
    assert.notEqual(invoke(initial).status, 0);
    assert.equal(remote(), initial);
  }));

test("refuses a workflow running outside main", () =>
  fixture(async ({ initial, invoke, remote }) => {
    assert.notEqual(
      invoke(undefined, { GITHUB_REF: "refs/heads/other" }).status,
      0,
    );
    assert.equal(remote(), initial);
  }));

test("does not create a missing Hostinger branch", () =>
  fixture(
    async ({ invoke, remote }) => {
      assert.notEqual(invoke().status, 0);
      assert.equal(remote(), "");
    },
    { branch: false },
  ));
