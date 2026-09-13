# Protected contact deployment

Prepared integration, not a record of a live deployment or received email.

The existing React/Vite prerender stays intact. `npm start` runs a separate Node
entry point, `server/index.mjs`, which serves only a snapshot of regular files
under `dist`. The frontend asks `/api/contact/config` for availability. It renders
no form if that endpoint is unavailable or disabled. GitHub Pages remains a
static fallback, not an email backend.

## Runtime configuration

### Hostinger release layout

Provider support confirmed output directory `release` and entry file
`server/index.mjs` (relative to that output, not `release/server/index.mjs`).
Use `npm run build:release`. It retains `release/server/` and `release/dist/`
as siblings and bundles the pinned, dependency-free Nodemailer package under
`release/node_modules/`, without copying environment files or repository sources.
The runtime package lists Nodemailer in production dependencies as well.
The script refuses to replace an unrecognized release directory or follow symlinks.

`npm run verify` includes packaging and a test that copies the release to a fresh
temporary directory, starts its real entry without credentials or inherited
Node module paths, compares all 28 routes, and checks source/dependency paths
return 404. These tests prove Node behavior, not upstream LiteSpeed behavior.
Before hosted activation, check that Hostinger does not serve server files,
package metadata, or bundled dependencies directly ahead of Node.

Support specifies port 3000 with Passenger managing the connection. Keep contact
disabled for initial hosted validation. No trusted X-Forwarded-For sanitization
was confirmed; do not change the current conservative socket-peer limiter.
The temporary provider domain is public, not private staging. It does not prove
an isolated preview exists for the already-connected production domain. Do not
transfer credentials or enable mail on a new preview without a separate decision.

Set these as server-only environment variables, never Vite-prefixed variables:

- `CONTACT_ENABLED=true`, only after the deployment gate below.
- `CONTACT_FROM`: verified existing sender address.
- `CONTACT_TO`: owner-approved fixed receiving mailbox.
- `SMTP_USER`, `SMTP_PASSWORD`: existing Brevo SMTP credentials.
- `TURNSTILE_SECRET`: the dedicated Musyg Contact secret.
- `PORT`: provider-assigned listening port; defaults to 3000 locally.
- `HOST`: bind address confirmed with the host; defaults to loopback locally.

Do not copy secrets into this document, Git, `public`, `dist`, screenshots or
logs. `.env*` files are ignored; no secret file is loaded automatically.
The public site key is not a secret. The server validates the exact hostname
`musyg.com` and action `contact`, including when a widget allows subdomains.

Brevo transport uses port 587 with mandatory, verified STARTTLS. No attachments,
HTML, auto-replies or automatic send retries. Only server configuration controls
the sender and recipient; the visitor controls a validated Reply-To address.

## Limits and data

JSON bodies are capped at 32 KiB. The server admits two concurrent provider
operations, three attempts per socket peer per ten minutes, and twenty attempts
per hour globally. The peer map is capped at 1,000 entries. Proxy headers are
deliberately ignored: behind a shared proxy, visitors share the peer limit until
the provider's trusted proxy boundary is verified. Limits are process-local and
reset on restart; do not scale horizontally without a shared limiter. This is a
deployment gate, not a claim of distributed protection.

The application does not persist or log message bodies, email addresses, tokens
or SMTP responses. It holds them in memory while handling the request. The
provider and receiving mailbox retain their own data; confirm and document actual
retention before public release. This direct SMTP design does not use WordPress
or its FluentSMTP message-log table.

## Deployment gate

1. Run `npm ci` and `npm run verify` on supported Node. Server HTTP tests run
   after the prerendered build, including from a clean checkout.
2. Confirm Hostinger's backend entry point, root/build output, `HOST`, `PORT`,
   proxy trust and timeouts. The current Vite-only preset does not start this
   server. Keep automatic deployment OFF and preserve the previous release.
3. Obtain explicit approval before transferring existing SMTP and Turnstile
   secrets to Hostinger. Confirm the sender address and provider/mail retention.
4. Test the private deployment with a human-completed real Turnstile challenge.
   Use one synthetic message and independently check its arrival in the intended
   mailbox. SMTP acceptance alone is not delivery proof.
5. Verify all public EN/FR routes, deep links, genuine 404s, mobile/desktop,
   protected contact errors and accessibility, then publish with rollback ready.

Documentation: [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/),
[Nodemailer SMTP](https://nodemailer.com/smtp),
[Hostinger Node deployment](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).
