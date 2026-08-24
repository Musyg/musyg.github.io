import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const roots = [join(repositoryRoot, "src"), join(repositoryRoot, "public")];
const files = [
  join(repositoryRoot, "index.html"),
  join(repositoryRoot, "README.md"),
];
const readableExtensions = new Set([
  ".ts",
  ".tsx",
  ".css",
  ".html",
  ".md",
  ".txt",
  ".xml",
]);

async function collect(directory) {
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === "ENOENT") return;
    throw error;
  }

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (readableExtensions.has(extname(entry.name))) files.push(path);
  }
}

for (const root of roots) await collect(root);

const checks = [
  { label: "em dash", pattern: /—/u },
  { label: "emoji", pattern: /\p{Extended_Pictographic}/u },
  { label: "retired blue", pattern: /#0068c9/iu },
  {
    label: "independent role qualifier",
    pattern: /independent\s+(?:security\s+)?researcher/iu,
  },
  { label: "email address", pattern: /[\w.+-]+@[\w.-]+\.[a-z]{2,}/iu },
  { label: "local URL", pattern: /(?:localhost|127\.0\.0\.1|file:\/\/)/iu },
  { label: "Windows local path", pattern: /[a-z]:\\(?:users|windows)\\/iu },
];

const errors = [];

for (const path of files) {
  const content = await readFile(path, "utf8");
  const displayPath = relative(repositoryRoot, path);

  for (const check of checks) {
    if (check.pattern.test(content))
      errors.push(`${displayPath}: forbidden ${check.label}`);
  }

  if (
    /background(?:-color)?\s*:\s*(?:white|#fff(?:fff)?|rgb\(\s*255\s+255\s+255\s*\))/iu.test(
      content,
    )
  ) {
    errors.push(`${displayPath}: forbidden light background`);
  }
}

const indexCss = await readFile(
  join(repositoryRoot, "src", "index.css"),
  "utf8",
);
if (
  !/--canvas:\s*#0f1216/iu.test(indexCss) ||
  !/--surface:\s*#151a21/iu.test(indexCss)
) {
  errors.push("src/index.css: required dark surface tokens changed");
}
if (!/--accent:\s*#005eff/iu.test(indexCss)) {
  errors.push("src/index.css: required #005EFF accent changed");
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Content guard passed for ${files.length} files.`);
}
