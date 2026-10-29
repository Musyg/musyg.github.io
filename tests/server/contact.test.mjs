import test from "node:test";
import assert from "node:assert/strict";
import {
  configuration,
  createContactService,
  smtpOptions,
} from "../../server/contact.mjs";

const timestamp = Date.parse("2026-09-13T12:00:00Z");
const config = {
  origin: "https://musyg.com",
  hostname: "musyg.com",
  secret: "test-only-secret",
  siteKey: "test-public",
  from: "sender@example.com",
  to: "recipient@example.com",
};
const body = {
  name: "Test User",
  email: "visitor@example.com",
  message: "A synthetic message for the local tests.",
  subject: "project",
  website: "",
  token: "test-token",
  locale: "fr",
};
function setup(result = {}) {
  const sent = [],
    requests = [];
  const service = createContactService({
    config,
    now: () => timestamp,
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return {
        ok: true,
        json: async () => ({
          success: true,
          hostname: "musyg.com",
          action: "contact",
          challenge_ts: new Date(timestamp).toISOString(),
          ...result,
        }),
      };
    },
    sendMail: async (mail) => {
      sent.push(mail);
      return { accepted: [config.to] };
    },
  });
  const submit = (changes = {}, extras = {}) =>
    service.submit({
      body: { ...body, ...changes },
      peer: "local-peer",
      requestOrigin: config.origin,
      ...extras,
    });
  return { service, sent, requests, submit };
}
test("incomplete or disabled configuration fails closed", () => {
  assert.equal(configuration({}), null);
  assert.equal(configuration({ CONTACT_ENABLED: "true" }), null);
  const service = createContactService({
    config: null,
    sendMail: () => assert.fail(),
  });
  assert.deepEqual(service.publicConfig(), { enabled: false });
});
test("valid submission fixes routing and exposes no secret", async () => {
  const { submit, sent, requests, service } = setup();
  assert.equal((await submit()).status, 202);
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].envelope, { from: config.from, to: [config.to] });
  assert.equal(sent[0].replyTo, body.email);
  assert.equal(sent[0].subject, "[Portfolio] project");
  assert.equal(sent[0].html, undefined);
  assert.deepEqual(service.publicConfig(), {
    enabled: true,
    siteKey: "test-public",
  });
  assert.equal(requests[0].options.redirect, "error");
  assert.equal(JSON.parse(requests[0].options.body).remoteip, undefined);
});
for (const [name, result] of Object.entries({
  failed: { success: false },
  wrongHost: { hostname: "other.example" },
  wrongAction: { action: "login" },
  expired: { challenge_ts: "2020-01-01T00:00:00Z" },
  missingDate: { challenge_ts: null },
})) {
  test(`Turnstile rejects ${name}`, async () => {
    const s = setup(result);
    assert.equal((await s.submit()).code, "verification");
    assert.equal(s.sent.length, 0);
  });
}
for (const [name, changes] of Object.entries({
  headerNewline: { email: "a@example.com\r\nBcc:other@example.com" },
  nameControl: { name: "A\nB" },
  recipientOverride: { to: "other@example.com" },
  invalidSubject: { subject: "Injected" },
  tokenTooLong: { token: "x".repeat(2049) },
  messageTooLong: { message: "x".repeat(5001) },
  short: { message: "short" },
  invalidLocale: { locale: "de" },
})) {
  test(`validation rejects ${name} before provider call`, async () => {
    const s = setup();
    assert.equal((await s.submit(changes)).status, 400);
    assert.equal(s.requests.length, 0);
  });
}
test("origin is mandatory and exact", async () => {
  const s = setup();
  assert.equal(
    (await s.submit({}, { requestOrigin: "https://other.example" })).status,
    403,
  );
  assert.equal(s.sent.length, 0);
});
test("honeypot never reaches providers", async () => {
  const s = setup();
  assert.equal((await s.submit({ website: "bot" })).status, 202);
  assert.equal(s.requests.length, 0);
});
test("peer and global limits are bounded", async () => {
  const s = setup();
  for (let i = 0; i < 3; i++) assert.equal((await s.submit()).status, 202);
  assert.equal((await s.submit()).status, 429);
  for (let i = 0; i < 17; i++)
    assert.equal((await s.submit({}, { peer: `peer-${i}` })).status, 202);
  assert.equal((await s.submit({}, { peer: "new-peer" })).status, 429);
});
test("provider errors are generic and never retried", async () => {
  let count = 0;
  const service = createContactService({
    config,
    fetchImpl: async () => {
      count++;
      throw new Error("secret-looking-provider-detail");
    },
    sendMail: () => assert.fail(),
  });
  const result = await service.submit({
    body,
    peer: "local",
    requestOrigin: config.origin,
  });
  assert.deepEqual(result, { status: 503, code: "uncertain" });
  assert.equal(count, 1);
});
test("SMTP exception is not retried and does not expose provider details", async () => {
  let sends = 0;
  const service = createContactService({
    config,
    now: () => timestamp,
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        success: true,
        hostname: "musyg.com",
        action: "contact",
        challenge_ts: new Date(timestamp).toISOString(),
      }),
    }),
    sendMail: async () => {
      sends++;
      throw new Error("private SMTP detail");
    },
  });
  assert.deepEqual(
    await service.submit({ body, peer: "peer", requestOrigin: config.origin }),
    { status: 503, code: "uncertain" },
  );
  assert.equal(sends, 1);
});
test("two active provider operations block a third until completion", async () => {
  const releases = [];
  const service = createContactService({
    config,
    now: () => timestamp,
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        success: true,
        hostname: "musyg.com",
        action: "contact",
        challenge_ts: new Date(timestamp).toISOString(),
      }),
    }),
    sendMail: () =>
      new Promise((resolve) =>
        releases.push(() => resolve({ accepted: [config.to] })),
      ),
  });
  const first = service.submit({
    body,
    peer: "a",
    requestOrigin: config.origin,
  });
  const second = service.submit({
    body,
    peer: "b",
    requestOrigin: config.origin,
  });
  assert.equal(
    (await service.submit({ body, peer: "c", requestOrigin: config.origin }))
      .status,
    429,
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(releases.length, 2);
  for (const release of releases) release();
  assert.equal((await first).status, 202);
  assert.equal((await second).status, 202);
});
test("SMTP requires verified TLS and disables content fetching/logging", () => {
  const options = smtpOptions(config);
  assert.equal(options.requireTLS, true);
  assert.equal(options.tls.rejectUnauthorized, true);
  assert.equal(options.disableFileAccess, true);
  assert.equal(options.disableUrlAccess, true);
  assert.equal(options.logger, false);
  assert.equal(options.pool, false);
});
