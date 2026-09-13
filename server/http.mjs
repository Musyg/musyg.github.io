import { createServer } from "node:http";
import { readdir, readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

export async function portfolioServer({ dist, contact }) {
  // Snapshot only regular build files; never expose source, dotfiles or symlinks.
  const files = new Map();
  async function collect(directory, prefix = "") {
    for (const item of await readdir(directory, { withFileTypes: true })) {
      if (item.name.startsWith(".")) continue;
      const relative = `${prefix}${item.name}`;
      if (item.isDirectory())
        await collect(join(directory, item.name), `${relative}/`);
      else if (item.isFile() && types[extname(item.name)])
        files.set(`/${relative}`, await readFile(join(directory, item.name)));
    }
  }
  await collect(dist);
  if (!files.has("/404.html") || !files.has("/index.html"))
    throw new Error("Missing prerendered build");
  const server = createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    function json(status, data) {
      if (status >= 400) res.setHeader("Connection", "close");
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(data));
    }
    try {
      const path = (req.url ?? "/").split("?")[0];
      if (path === "/api/contact/config" && req.method === "GET")
        return json(200, contact.publicConfig());
      if (path.startsWith("/api/")) {
        if (path !== "/api/contact") return json(404, { code: "not_found" });
        if (req.method !== "POST") {
          res.setHeader("Allow", "POST");
          return json(405, { code: "method" });
        }
        if (
          !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(
            req.headers["content-type"] ?? "",
          ) ||
          req.headers["content-encoding"]
        )
          return json(415, { code: "invalid" });
        const maxBytes = 32768;
        if (Number(req.headers["content-length"]) > maxBytes)
          return json(413, { code: "invalid" });
        let size = 0;
        const chunks = [];
        for await (const chunk of req) {
          size += chunk.length;
          if (size > maxBytes) {
            json(413, { code: "invalid" });
            return;
          }
          chunks.push(chunk);
        }
        let body;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } catch {
          return json(400, { code: "invalid" });
        }
        // Never trust client-supplied proxy headers. Behind a shared proxy this
        // deliberately yields a conservative shared limit until its trust is verified.
        const result = await contact.submit({
          requestOrigin: req.headers.origin,
          peer: req.socket.remoteAddress ?? "unknown",
          body,
        });
        if (result.status === 429) res.setHeader("Retry-After", "600");
        return json(result.status, { code: result.code });
      }
      if (!["GET", "HEAD"].includes(req.method)) {
        res.setHeader("Allow", "GET, HEAD");
        res.writeHead(405);
        return res.end();
      }
      let file = path;
      if (file.endsWith("/")) file += "index.html";
      else if (files.has(`${file}/index.html`)) {
        res.writeHead(308, {
          Location: `${path}/${(req.url ?? "").includes("?") ? `?${req.url.split("?").slice(1).join("?")}` : ""}`,
        });
        return res.end();
      }
      const found = files.has(file);
      const data = files.get(found ? file : "/404.html");
      res.writeHead(found ? 200 : 404, {
        "Content-Type": types[extname(found ? file : "/404.html")],
        "Cache-Control":
          file.startsWith("/assets/") && found
            ? "public, max-age=31536000, immutable"
            : "no-cache",
        "Content-Length": data.length,
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      if (!res.headersSent) json(500, { code: "unavailable" });
      else res.destroy();
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.setTimeout(20000, (socket) => socket.destroy());
  server.maxHeadersCount = 60;
  server.maxConnections = 100;
  return server;
}
