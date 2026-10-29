import { execFileSync } from "node:child_process";

function git(...args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

try {
  if (
    process.env.GITHUB_ACTIONS !== "true" ||
    process.env.GITHUB_REPOSITORY !== "Musyg/musyg.github.io" ||
    process.env.GITHUB_REF !== "refs/heads/main"
  )
    throw new Error("Hostinger synchronization requires the main workflow.");
  const target = process.argv[2];
  if (
    !/^[a-f0-9]{40}$/.test(target ?? "") ||
    git("rev-parse", "HEAD") !== target
  )
    throw new Error("The checked-out revision must be the validated target.");

  git("fetch", "--no-tags", "origin", "feature/contact-protected");
  const current = git("rev-parse", "FETCH_HEAD");
  if (current === target) {
    console.log(`Hostinger branch already points to ${target}.`);
  } else {
    try {
      git("merge-base", "--is-ancestor", current, target);
    } catch {
      throw new Error(
        "Hostinger contains commits outside this revision; integrate them before retrying.",
      );
    }
    // A normal push also rejects a concurrent, divergent remote update.
    git("push", "origin", `${target}:refs/heads/feature/contact-protected`);
    console.log(
      `Hostinger branch advanced to ${target}; publication remains to be verified.`,
    );
  }
} catch (error) {
  // Git diagnostics can contain transport details; keep the public failure bounded.
  console.error(
    error instanceof Error && !error.stderr
      ? error.message
      : "Hostinger synchronization rejected by Git; no history was rewritten.",
  );
  process.exitCode = 1;
}
