# Gilles Musy portfolio

Bilingual professional portfolio for three distinct practices:

- software engineering;
- agentic AI engineering;
- security research.

The site uses React, TypeScript, and Vite, with prerendered pages.

**Portfolio:** <https://musyg.com/> · [Français](https://musyg.com/fr/)

## Current state

The bilingual production site is published on Hostinger at <https://musyg.com/> with the final
black and `#005EFF` visual direction. It includes the full route set, static prerendering,
responsive layouts, metadata, content guards, tests, accessibility checks, and GitHub
Pages workflows. The initial release passed independent local review, CI, deployment,
public route checks, and post-publication verification.

Production is maintained on `feature/contact-protected`. The `main` branch and its
GitHub Pages publication at <https://musyg.github.io/> remain separate; the local
development commands below apply to this branch.

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
