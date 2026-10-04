import { renderToString } from "react-dom/server";
import App from "./App";
import { canonicalUrl, publicRoutes, routeFor } from "./routes";
import { professionalProfiles } from "./content/site";
import { engagements } from "./content/engagements";

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
  const imageAlt =
    route.locale === "fr"
      ? "Portfolio de Gilles Musy : recherche en sécurité, ingénierie IA et systèmes logiciels"
      : "Gilles Musy portfolio: security research, AI engineering, and software systems";
  const personId = canonicalUrl("/#gilles-musy");
  const websiteId = canonicalUrl("/#website");
  const engagement = route.practice
    ? engagements[route.practice][route.locale]
    : null;
  const structuredData =
    route.kind !== "not-found"
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Person",
            "@id": personId,
            name: "Gilles Musy",
            alternateName: "Musyg",
            url: canonicalUrl("/"),
            jobTitle: ["Developer", "AI engineer", "Security researcher"],
            sameAs: professionalProfiles.map((profile) => profile.url),
            knowsAbout: [
              "Software engineering",
              "Agentic AI engineering",
              "Application security",
              "Smart contract security",
              "Indirect prompt injection",
              "AI agent security",
              "AI red teaming",
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": websiteId,
            name: "Gilles Musy portfolio",
            url: canonicalUrl("/"),
            inLanguage: ["en", "fr"],
            publisher: { "@id": personId },
          },
          {
            "@context": "https://schema.org",
            "@type": route.kind === "about" ? "ProfilePage" : "WebPage",
            "@id": `${canonical}#webpage`,
            url: canonical,
            name: route.title,
            description: route.description,
            inLanguage: route.locale,
            isPartOf: { "@id": websiteId },
            author: { "@id": personId },
            ...(route.kind === "about" || route.kind === "home"
              ? { mainEntity: { "@id": personId } }
              : {}),
          },
          ...(engagement
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "Service",
                  "@id": `${canonical}#service`,
                  url: `${canonical}#engagement-title`,
                  name: engagement.title,
                  description: engagement.introduction,
                  provider: { "@id": personId },
                  areaServed: "Worldwide",
                  mainEntityOfPage: { "@id": `${canonical}#webpage` },
                },
              ]
            : []),
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
    '<meta property="og:image:type" content="image/png">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${escapeAttribute(imageAlt)}">`,
    `<meta property="og:locale" content="${route.locale === "fr" ? "fr_CH" : "en_CH"}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeAttribute(route.title)}">`,
    `<meta name="twitter:description" content="${escapeAttribute(route.description)}">`,
    `<meta name="twitter:image" content="${escapeAttribute(imageUrl)}">`,
    `<meta name="twitter:image:alt" content="${escapeAttribute(imageAlt)}">`,
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
