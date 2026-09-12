# npm migration

This branch replaces pnpm with npm without changing the portfolio's content,
design, dependency ranges, or application architecture. The baseline is commit
`ef54535` from `deploy/hostinger-custom-domain`, not the older `main` branch.

## Toolchain and reproducibility

- Node.js 24, npm 11.6.0 (installed explicitly in both GitHub workflows).
- `package-lock.json` v3 is the only dependency lockfile; use `npm ci`.
- Build, verification, and Playwright preview scripts no longer invoke pnpm.
- Full build remains type checks, content checks, client build, SSR build, and
  prerendering. `build:client` alone is not a release build.
- The npm lock preserves all 16 direct dependency versions and the full set of
  187 package/version pairs from the baseline pnpm lock, with matching integrity
  hashes. Dependency resolution paths can differ between package managers.

An initial npm resolution selected newer versions. It was discarded before
publication. Temporary version constraints seeded the baseline versions and were
removed. A nested `data-urls` URL-parser entry required a targeted correction to
`whatwg-url@16.0.1`, using its published npm metadata and the baseline integrity.
Independent checks found no missing or out-of-range dependency edges in the final
lock. No permanent overrides or relaxed peer-dependency flags are used.

## Deployment boundary

Local and GitHub verification do not establish Hostinger recovery. The live site
continues to serve the previously validated uploaded build. This branch does not
enable automatic deployment, merge the migration PR, or change hosting settings.

A separately controlled Hostinger trial must select the current validated source,
npm, `npm run build`, and output `dist`. Verify all prerendered routes, the actual
404 status, asset hashes, and bilingual content before enabling automation.
Do not redeploy the older `main` source over the live site. DNS, mail, and the
separate `www` certificate issue are outside this migration.
