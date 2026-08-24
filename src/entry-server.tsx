import { renderToString } from "react-dom/server";
import App from "./App";
import { canonicalUrl, publicRoutes, routeFor } from "./routes";
import { professionalProfiles } from "./content/site";

export const routePaths = publicRoutes.map((route) => route.path);

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeJson(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function render(pathname: string) {
  const route = routeFor(pathname);
  const canonical = canonicalUrl(route.path);
  const counterpart = canonicalUrl(route.counterpart);
  const enUrl = route.locale === "en" ? canonical : counterpart;
  const frUrl = route.locale === "fr" ? canonical : counterpart;
  const imageUrl = canonicalUrl("/social-preview.png");
  const structuredData =
    route.kind === "home"
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Gilles Musy",
            url: canonicalUrl("/"),
            sameAs: professionalProfiles.map((profile) => profile.url),
            knowsAbout: [
              "Software engineering",
              "Agentic AI engineering",
              "Application security",
              "Smart contract security",
              "Indirect prompt injection",
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Gilles Musy portfolio",
            url: canonicalUrl("/"),
            inLanguage: ["en", "fr"],
          },
        ]
      : null;

  const head = [
    `<title>${escapeAttribute(route.title)}</title>`,
    `<meta name="description" content="${escapeAttribute(route.description)}">`,
    `<link rel="canonical" href="${escapeAttribute(canonical)}">`,
    `<link rel="alternate" hreflang="en" href="${escapeAttribute(enUrl)}">`,
    `<link rel="alternate" hreflang="fr" href="${escapeAttribute(frUrl)}">`,
    `<link rel="alternate" hreflang="x-default" href="${escapeAttribute(enUrl)}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:title" content="${escapeAttribute(route.title)}">`,
    `<meta property="og:description" content="${escapeAttribute(route.description)}">`,
    `<meta property="og:url" content="${escapeAttribute(canonical)}">`,
    `<meta property="og:image" content="${escapeAttribute(imageUrl)}">`,
    `<meta property="og:locale" content="${route.locale === "fr" ? "fr_CH" : "en_CH"}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeAttribute(route.title)}">`,
    `<meta name="twitter:description" content="${escapeAttribute(route.description)}">`,
    `<meta name="twitter:image" content="${escapeAttribute(imageUrl)}">`,
    structuredData
      ? `<script type="application/ld+json">${escapeJson(structuredData)}</script>`
      : "",
  ]
    .filter(Boolean)
    .join("\n    ");

  return {
    html: renderToString(<App pathname={route.path} />),
    head,
    lang: route.locale,
  };
}
