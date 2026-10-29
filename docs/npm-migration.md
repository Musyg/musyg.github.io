# npm migration

The initial migration replaced pnpm with npm without changing the portfolio's
content, design, dependency ranges, or application architecture. Its baseline was commit
`ef54535` from `deploy/hostinger-custom-domain`, not the older `main` branch.

## Toolchain and reproducibility

- Node.js 24, npm 11.6.0 (installed explicitly in both GitHub workflows).
- `package-lock.json` v3 is the only dependency lockfile; use `npm ci`.
- Build, verification, and Playwright preview scripts no longer invoke pnpm.
- The production build runs the dependency audit, type checks, content checks,
  client build, SSR build, prerendering, and Node runtime packaging.
  `build:client` alone is not a release build.
- At migration time, the npm lock preserved all 16 direct dependency versions and the full set of
  187 package/version pairs from the baseline pnpm lock, with matching integrity
  hashes. Dependency resolution paths can differ between package managers.

An initial npm resolution selected newer versions. It was discarded before
publication. Temporary version constraints seeded the baseline versions and were
removed. A nested `data-urls` URL-parser entry required a targeted correction to
`whatwg-url@16.0.1`, using its published npm metadata and the baseline integrity.
Independent checks found no missing or out-of-range dependency edges in the final
lock. No permanent overrides or relaxed peer-dependency flags are used.

## Deployment boundary

The production branch has since advanced to `feature/contact-protected` and the
packaged Node.js contact runtime. Its documented Hostinger integration deploys
automatically from that branch, using npm, `npm run build`, output `release`, and
entry `server/index.mjs` relative to the output. The earlier static `dist` trial
instructions do not describe this runtime. GitHub Pages still publishes `main`
separately.

Local tests and GitHub checks alone do not establish a successful Hostinger
deployment. Verify the provider result and public HTML/asset hashes after each
production update. Keep DNS, mail configuration, and credentials unchanged during
dependency maintenance. See [deployment branches](deployment-branches.md) and
[the contact server layout](contact-server.md).
