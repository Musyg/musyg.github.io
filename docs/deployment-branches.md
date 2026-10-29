# Deployment branches

The portfolio has two independent publication paths. Updating a dependency on
`main` does not update the Hostinger production branch.

| Branch                                    | Publication                                               | Build/runtime                                                                                               |
| ----------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `main`                                    | GitHub Pages through `.github/workflows/deploy-pages.yml` | Static prerendered `dist`; no contact mail backend                                                          |
| `feature/contact-protected`               | Hostinger production integration described in `README.md` | Node.js 24, npm 11.6.0, `npm run build`, output `release`, entry `server/index.mjs` relative to that output |
| `deploy/hostinger-custom-domain` (PR #19) | Historical draft targeting `main`                         | Earlier static hosting preparation                                                                          |
| `maintenance/npm-hostinger` (PR #20)      | Historical draft targeting PR #19                         | Earlier npm migration                                                                                       |

The production branch already contains npm migration, the packaged contact
server, and newer bilingual content. Do not replace it with either historical
draft or with `main`. Preserve those branches and PRs as history until their
remaining differences have been reviewed explicitly.

## Dependency maintenance

Prepare changes on an isolated branch based on the current
`feature/contact-protected` revision and open a PR targeting that branch. Run a
frozen `npm ci`, the dependency audit, and the complete `npm run verify` suite.
The suite covers the prerendered site, contact validation/limits with fake
providers, and a release started without inherited credentials or module paths.
No real email delivery is required for a dependency update.

Vite builds the site; it does not select the hosting branch or enable automatic
deployment. Hostinger must retain the complete build command and the Node release
layout. `vite build` alone omits SSR prerendering and runtime packaging.

Quality also supports manual dispatch so that a revision containing `[skip ci]`
can be tested explicitly. Its concurrency group cancels only superseded Quality
runs on the same ref; it does not cancel Hostinger publication or IndexNow.
After successful verification it retains the packaged `release` as an artifact
for three days, including the generated marker and Apache routing file. The
packaging checks reject source/environment files and unsupported dependency
graphs before that artifact is uploaded.

## Publication verification

A successful merge or GitHub Quality run is not proof of Hostinger deployment.
After the production branch advances, verify the provider's effective source
branch, deployed revision, build result, and runtime entry point. Then compare
public HTML and referenced asset hashes against the validated build, check the
bilingual routes, a real 404, and the existing contact availability endpoint.
Keep credentials, contact configuration, DNS, mail settings, and provider secrets
out of Git and maintenance logs. Do not submit the live contact form during
automated verification.
