const origin = "https://musyg.com";
export const publicSiteKey = "0x4AAAAAAEyVjBP2j0Xe8abI";
const emailPattern =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,63}$/;
export function validEmail(value) {
  return (
    typeof value === "string" && value.length <= 254 && emailPattern.test(value)
  );
}
export function configuration(env) {
  if (env.CONTACT_ENABLED !== "true") return null;
  if (!validEmail(env.CONTACT_FROM) || !validEmail(env.CONTACT_TO)) return null;
  if (
    ![env.SMTP_USER, env.SMTP_PASSWORD, env.TURNSTILE_SECRET].every(
      (v) => typeof v === "string" && v.length > 0,
    )
  )
    return null;
  return {
    origin,
    hostname: "musyg.com",
    siteKey: publicSiteKey,
    secret: env.TURNSTILE_SECRET,
    from: env.CONTACT_FROM,
    to: env.CONTACT_TO,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
  };
}

export function smtpOptions(config) {
  return {
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    requireTLS: true,
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    auth: { user: config.user, pass: config.password },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    dnsTimeout: 10000,
    pool: false,
    logger: false,
    debug: false,
    transactionLog: false,
    disableFileAccess: true,
    disableUrlAccess: true,
    maxRecipients: 1,
  };
}

export function createContactService({
  config,
  sendMail,
  fetchImpl = fetch,
  now = Date.now,
}) {
  const peers = new Map();
  let windowEnd = 0,
    total = 0,
    active = 0;
  function permitted(peer) {
    const time = now();
    if (time >= windowEnd) {
      windowEnd = time + 3600000;
      total = 0;
    }
    for (const [key, value] of peers)
      if (time >= value.until) peers.delete(key);
    const entry = peers.get(peer) ?? { until: time + 600000, count: 0 };
    if (
      active >= 2 ||
      total >= 20 ||
      entry.count >= 3 ||
      (!peers.has(peer) && peers.size >= 1000)
    )
      return false;
    entry.count++;
    total++;
    peers.set(peer, entry);
    return true;
  }
  return {
    publicConfig: () =>
      config ? { enabled: true, siteKey: config.siteKey } : { enabled: false },
    async submit({ requestOrigin, peer, body }) {
      if (!config) return { status: 503, code: "unavailable" };
      if (requestOrigin !== config.origin)
        return { status: 403, code: "rejected" };
      if (!permitted(peer)) return { status: 429, code: "limited" };
      const fields = [
        "name",
        "email",
        "subject",
        "message",
        "website",
        "token",
        "locale",
      ];
      if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        Object.keys(body).some((key) => !fields.includes(key))
      )
        return { status: 400, code: "invalid" };
      if (!fields.every((key) => typeof body[key] === "string"))
        return { status: 400, code: "invalid" };
      if (body.website.length > 200) return { status: 400, code: "invalid" };
      if (body.website) return { status: 202, code: "accepted" };
      const name = body.name.trim(),
        message = body.message.trim();
      if (
        !name ||
        name.length > 100 ||
        // eslint-disable-next-line no-control-regex -- Reject header/control characters.
        /[\x00-\x1f\x7f]/.test(name) ||
        !validEmail(body.email) ||
        !["project", "job", "research", "other"].includes(body.subject) ||
        !["fr", "en"].includes(body.locale) ||
        message.length < 20 ||
        message.length > 5000 ||
        // eslint-disable-next-line no-control-regex -- Permit only normal text whitespace.
        /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(message) ||
        !body.token ||
        body.token.length > 2048
      )
        return { status: 400, code: "invalid" };
      active++;
      try {
        const response = await fetchImpl(
          "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            redirect: "error",
            signal: AbortSignal.timeout(8000),
            body: JSON.stringify({
              secret: config.secret,
              response: body.token,
            }),
          },
        );
        if (!response.ok) return { status: 503, code: "unavailable" };
        const result = await response.json();
        const age = now() - Date.parse(result.challenge_ts);
        if (
          result.success !== true ||
          result.hostname !== config.hostname ||
          result.action !== "contact" ||
          !Number.isFinite(age) ||
          age < -30000 ||
          age > 300000
        )
          return { status: 400, code: "verification" };
        // Single attempt only: a timeout may occur after SMTP has accepted a message.
        const sent = await sendMail({
          from: config.from,
          to: config.to,
          replyTo: body.email,
          envelope: { from: config.from, to: [config.to] },
          subject: `[Portfolio] ${body.subject}`,
          text: `Name: ${name}\nReply: ${body.email}\nLanguage: ${body.locale}\n\n${message}`,
          disableFileAccess: true,
          disableUrlAccess: true,
        });
        if (!sent?.accepted?.includes(config.to))
          return { status: 503, code: "uncertain" };
        return { status: 202, code: "accepted" };
      } catch {
        // Do not log message content, tokens, SMTP responses or credentials.
        return { status: 503, code: "uncertain" };
      } finally {
        active--;
      }
    },
  };
}
