# Gilles Musy portfolio

Bilingual professional portfolio for three distinct practices:

- software engineering;
- agentic AI engineering;
- security research.

The site uses React, TypeScript, and Vite, with prerendered pages deployed to
Hostinger at <https://musyg.com/>. The French version is at <https://musyg.com/fr/>.

## Current state

The bilingual production site is published at <https://musyg.com/> with the final
black and `#005EFF` visual direction. It includes the full route set, static prerendering,
responsive layouts, metadata, content guards, tests, accessibility checks, and GitHub
Pages workflows. The initial release passed independent local review, CI, deployment,
public route checks, and post-publication verification.

The 2026-09-12 Hostinger publication passed independent HTTPS checks for all 28
routes, all 39 public files, the real 404 response, robots.txt, and the sitemap.
The `www` hostname is not yet validated: its TLS certificate must be corrected
before the canonical redirect can be verified. Use the root-domain links above.

Hostinger currently serves an uploaded production build. Its automatic GitHub
deployment remains disabled following the provider's pnpm launcher failure. This
branch migrates the build to npm; Hostinger compatibility is not yet verified.
The existing GitHub Pages publication remains available separately; the domain's
registrar, DNS, and mail services remain with Infomaniak. Backend services and
Talos integration are separate future work, not part of this static deployment.

Every production page, section, card, panel, navigation element, and footer uses black
or a near-black neutral as its background. White and other light backgrounds are not
part of the portfolio identity.

## Local development

```bash
npm ci
npm run dev
npm run lint
npm run build
```

Use Node.js 24 and npm 11.6.0 (the CI version). `package-lock.json` is the sole
dependency lockfile. Run `npm run verify` for the full validation suite.
Hostinger must use npm, the complete `npm run build` command, and `dist` output.
Do not redeploy the older `main` branch or enable automatic deployment until the
current release and prerendered routes have been verified on Hostinger.

## Content boundaries

- Only public, attributable evidence belongs in production content.
- Private repositories, reports, credentials, email addresses, and local paths are
  excluded.
- Engineering work and security research are described separately.
- Active and planned work is never presented as a completed release.

## License

The repository is distributed under the all-rights-reserved terms in `LICENSE`.
Third-party names, links, and project media remain owned by their respective rights
holders unless stated otherwise.
