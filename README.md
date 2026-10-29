# Gilles Musy portfolio

Bilingual professional portfolio for three distinct practices:

- software engineering;
- agentic AI engineering;
- security research.

The site uses React, TypeScript, and Vite, with prerendered pages deployed to
Hostinger at <https://musyg.com/>. The French version is at <https://musyg.com/fr/>.

## Current state

The site presents software engineering, AI systems and security research in English
and French. It includes project case studies, technical publications and a contact
form, with black backgrounds and the identity blue `#005EFF`.

Production is deployed automatically to Hostinger from `feature/contact-protected`.
The build uses npm and packages prerendered pages together with the Node.js server.
Each case study presents its own technical scope without attributing it to another
project or agency.

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
Hostinger uses npm and the complete `npm run build` command. Set the output directory
to `release` and the entry file to `server/index.mjs`, relative to that directory.
The server serves the sibling `dist` directory. The older `main` branch is not the
production deployment branch.

See [deployment branches](docs/deployment-branches.md) for the separate GitHub
Pages and Hostinger publication paths and the dependency maintenance procedure.

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
