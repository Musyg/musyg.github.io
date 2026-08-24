# Gilles Musy portfolio

Bilingual professional portfolio for three distinct practices:

- software engineering;
- agentic AI engineering;
- security research.

The site uses React, TypeScript, and Vite. It is intended for static prerendering and
deployment to GitHub Pages at <https://musyg.github.io/>.

## Current state

The bilingual production site is published at <https://musyg.github.io/> with the final
black and `#005EFF` visual direction. It includes the full route set, static prerendering,
responsive layouts, metadata, content guards, tests, accessibility checks, and GitHub
Pages workflows. The initial release passed independent local review, CI, deployment,
public route checks, and post-publication verification.

Every production page, section, card, panel, navigation element, and footer uses black
or a near-black neutral as its background. White and other light backgrounds are not
part of the portfolio identity.

## Local development

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

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
