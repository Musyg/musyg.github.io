import { projects, type Locale, type Practice } from "./content/site";

export type RouteKind =
  | "home"
  | "work"
  | "project"
  | "practice"
  | "writing"
  | "about"
  | "contact"
  | "not-found";

export interface RouteEntry {
  path: string;
  counterpart: string;
  locale: Locale;
  kind: RouteKind;
  title: string;
  description: string;
  projectId?: string;
  practice?: Practice;
}

const siteName = "Gilles Musy";

const fixedRoutes: RouteEntry[] = [
  {
    path: "/",
    counterpart: "/fr/",
    locale: "en",
    kind: "home",
    title: `${siteName} | Security, AI and software engineering`,
    description:
      "Public portfolio of Gilles Musy across security research, agentic AI engineering, and software systems.",
  },
  {
    path: "/fr/",
    counterpart: "/",
    locale: "fr",
    kind: "home",
    title: `${siteName} | Sécurité, IA et ingénierie logicielle`,
    description:
      "Portfolio public de Gilles Musy consacré à la recherche en sécurité, à l’ingénierie IA agentique et aux systèmes logiciels.",
  },
  {
    path: "/work/",
    counterpart: "/fr/realisations/",
    locale: "en",
    kind: "work",
    title: `Work | ${siteName}`,
    description:
      "Evidence-backed software, AI, Web, blockchain, and security work by Gilles Musy.",
  },
  {
    path: "/fr/realisations/",
    counterpart: "/work/",
    locale: "fr",
    kind: "work",
    title: `Réalisations | ${siteName}`,
    description:
      "Réalisations documentées de Gilles Musy en logiciel, IA, Web, blockchain et sécurité.",
  },
  {
    path: "/engineering/",
    counterpart: "/fr/ingenierie/",
    locale: "en",
    kind: "practice",
    practice: "software",
    title: `Software engineering | ${siteName}`,
    description:
      "Backend, infrastructure, Web, product, blockchain, and open-source engineering by Gilles Musy.",
  },
  {
    path: "/fr/ingenierie/",
    counterpart: "/engineering/",
    locale: "fr",
    kind: "practice",
    practice: "software",
    title: `Ingénierie logicielle | ${siteName}`,
    description:
      "Ingénierie backend, infrastructure, Web, produit, blockchain et open source par Gilles Musy.",
  },
  {
    path: "/ai-systems/",
    counterpart: "/fr/systemes-ia/",
    locale: "en",
    kind: "practice",
    practice: "ai",
    title: `Agentic AI engineering | ${siteName}`,
    description:
      "Agent orchestration, resilience, local-model operations, memory, observability, and AI adoption.",
  },
  {
    path: "/fr/systemes-ia/",
    counterpart: "/ai-systems/",
    locale: "fr",
    kind: "practice",
    practice: "ai",
    title: `Ingénierie IA agentique | ${siteName}`,
    description:
      "Orchestration, résilience, modèles locaux, mémoire, observabilité et adoption de l’IA.",
  },
  {
    path: "/security-research/",
    counterpart: "/fr/recherche-securite/",
    locale: "en",
    kind: "practice",
    practice: "security",
    title: `Security research | ${siteName}`,
    description:
      "Web, application, smart-contract, ZK, applied-cryptography, and agentic AI security research.",
  },
  {
    path: "/fr/recherche-securite/",
    counterpart: "/security-research/",
    locale: "fr",
    kind: "practice",
    practice: "security",
    title: `Recherche en sécurité | ${siteName}`,
    description:
      "Recherche sur la sécurité Web, applicative, des smart contracts, ZK et des systèmes d’IA agentiques.",
  },
  {
    path: "/writing/",
    counterpart: "/fr/publications/",
    locale: "en",
    kind: "writing",
    title: `Writing | ${siteName}`,
    description:
      "Public technical writing by Gilles Musy, including the evidence-led AI Adoption Playbook.",
  },
  {
    path: "/fr/publications/",
    counterpart: "/writing/",
    locale: "fr",
    kind: "writing",
    title: `Publications | ${siteName}`,
    description:
      "Publications techniques de Gilles Musy, dont le guide AI Adoption Playbook fondé sur les preuves.",
  },
  {
    path: "/about/",
    counterpart: "/fr/a-propos/",
    locale: "en",
    kind: "about",
    title: `About | ${siteName}`,
    description:
      "Professional scope, working method, and evidence boundaries for Gilles Musy.",
  },
  {
    path: "/fr/a-propos/",
    counterpart: "/about/",
    locale: "fr",
    kind: "about",
    title: `À propos | ${siteName}`,
    description:
      "Périmètre professionnel, méthode de travail et limites des preuves de Gilles Musy.",
  },
  {
    path: "/contact/",
    counterpart: "/fr/contact/",
    locale: "en",
    kind: "contact",
    title: `Contact | ${siteName}`,
    description:
      "Verified public professional profiles for contacting Gilles Musy without exposing a public email address.",
  },
  {
    path: "/fr/contact/",
    counterpart: "/contact/",
    locale: "fr",
    kind: "contact",
    title: `Contact | ${siteName}`,
    description:
      "Profils professionnels publics vérifiés pour contacter Gilles Musy sans exposer d’adresse email publique.",
  },
];

const projectRoutes: RouteEntry[] = projects.flatMap((project) => {
  const enPath = `/work/${project.slug.en}/`;
  const frPath = `/fr/realisations/${project.slug.fr}/`;

  return [
    {
      path: enPath,
      counterpart: frPath,
      locale: "en",
      kind: "project",
      projectId: project.id,
      title: `${project.title} | ${siteName}`,
      description: project.summary.en,
    },
    {
      path: frPath,
      counterpart: enPath,
      locale: "fr",
      kind: "project",
      projectId: project.id,
      title: `${project.title} | ${siteName}`,
      description: project.summary.fr,
    },
  ];
});

export const publicRoutes: RouteEntry[] = [...fixedRoutes, ...projectRoutes];

export function normalizePath(pathname: string): string {
  const clean = pathname.split(/[?#]/, 1)[0] || "/";

  if (clean === "/") {
    return "/";
  }

  return `${clean.replace(/^\/+|\/+$/g, "")}/`.replace(/^/, "/");
}

export function routeFor(pathname: string): RouteEntry {
  const normalized = normalizePath(pathname);
  const match = publicRoutes.find((route) => route.path === normalized);

  if (match) {
    return match;
  }

  const locale: Locale =
    normalized === "/fr/" || normalized.startsWith("/fr/") ? "fr" : "en";

  return {
    path: normalized,
    counterpart: locale === "fr" ? "/" : "/fr/",
    locale,
    kind: "not-found",
    title:
      locale === "fr"
        ? `Page introuvable | ${siteName}`
        : `Page not found | ${siteName}`,
    description:
      locale === "fr"
        ? "La page demandée ne fait pas partie du portfolio public."
        : "The requested page is not part of the public portfolio.",
  };
}

export function projectPath(projectId: string, locale: Locale): string {
  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    return locale === "fr" ? "/fr/realisations/" : "/work/";
  }

  return locale === "fr"
    ? `/fr/realisations/${project.slug.fr}/`
    : `/work/${project.slug.en}/`;
}

export function homePath(locale: Locale): string {
  return locale === "fr" ? "/fr/" : "/";
}

export function workPath(locale: Locale): string {
  return locale === "fr" ? "/fr/realisations/" : "/work/";
}

export function practicePath(practice: Practice, locale: Locale): string {
  const paths: Record<Practice, Record<Locale, string>> = {
    software: { en: "/engineering/", fr: "/fr/ingenierie/" },
    ai: { en: "/ai-systems/", fr: "/fr/systemes-ia/" },
    security: { en: "/security-research/", fr: "/fr/recherche-securite/" },
  };

  return paths[practice][locale];
}

export function writingPath(locale: Locale): string {
  return locale === "fr" ? "/fr/publications/" : "/writing/";
}

export function aboutPath(locale: Locale): string {
  return locale === "fr" ? "/fr/a-propos/" : "/about/";
}

export function contactPath(locale: Locale): string {
  return locale === "fr" ? "/fr/contact/" : "/contact/";
}

export const siteOrigin = "https://musyg.github.io";

export function canonicalUrl(path: string): string {
  return new URL(path, siteOrigin).toString();
}
