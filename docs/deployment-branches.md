# Deployment branches

The portfolio has one shared source, `main`, with 34 bilingual routes and one npm
lock. `musyg.com` is canonical. The same validated application is published to
GitHub Pages as a static copy and to Hostinger with its packaged contact server.

| Branch                                    | Publication                                               | Build/runtime                                                                                               |
| ----------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `main`                                    | GitHub Pages through `.github/workflows/deploy-pages.yml` | Static prerendered `dist`; no contact mail backend                                                          |
| `feature/contact-protected`               | Hostinger production integration described in `README.md` | Node.js 24, npm 11.6.0, `npm run build`, output `release`, entry `server/index.mjs` relative to that output |
| `deploy/hostinger-custom-domain` (PR #19) | Historical source targeting `main`                        | Integrated static hosting preparation                                                                       |
| `maintenance/npm-hostinger` (PR #20)      | Historical source targeting PR #19                        | Integrated npm migration                                                                                    |

The historical PR #19/#20 branches remain preserved. Their complete histories,
the current 34-route production content, and the npm migration are integrated
through the harmonization PR into `main`. They are no longer independent release
candidates.

After the complete validation and successful Pages publication, the
`sync-hostinger` job advances `feature/contact-protected` to the exact same commit.
Hostinger keeps its existing repository connection, output `release`, and Node
entry point. The mirror accepts only a normal descendant update: missing branches,
divergence, wrong revisions and non-main workflow contexts are rejected. No
independent production work is overwritten and no branch is deleted.

## Dependency maintenance

Prepare changes on an isolated branch based on the current `main` and open a PR
targeting `main`. Run a
frozen `npm ci`, the dependency audit, and the complete `npm run verify` suite.
The suite covers the prerendered site, contact validation/limits with fake
providers, and a release started without inherited credentials or module paths.
It also tests the mirror update against temporary local Git repositories,
including preservation of an independent production commit. No real email
delivery is required for a dependency update.

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

The synchronization job alone receives repository contents write permission.
It uses the workflow's existing GitHub token, so its push does not start another
GitHub Actions build. IndexNow therefore also listens to `main` and retains its
existing wait for the live Hostinger sitemap. No new provider secret is needed.
See [GitHub's workflow-trigger rules](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

## Publication verification

A successful merge or GitHub Quality run is not proof of Hostinger deployment.
After the production branch advances, verify the provider's effective source
branch, deployed revision, build result, and runtime entry point. Then compare
public HTML and referenced asset hashes against the validated build, check the
bilingual routes, a real 404, and the existing contact availability endpoint.
Both targets also serve `build-info.json`, containing only the number of routes
and a deterministic hash of the application inputs. This identifies matching
builds without exposing environment values or depending on provider Git metadata.
Keep credentials, contact configuration, DNS, mail settings, and provider secrets
out of Git and maintenance logs. Do not submit the live contact form during
automated verification.
