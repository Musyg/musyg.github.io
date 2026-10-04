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
      "Gilles Musy (Musyg), freelance developer, AI engineer and security researcher. AI agents, full-stack development and red teaming. Worldwide engagements.",
  },
  {
    path: "/fr/",
    counterpart: "/",
    locale: "fr",
    kind: "home",
    title: `${siteName} | Sécurité, IA et ingénierie logicielle`,
    description:
      "Gilles Musy (Musyg), développeur freelance, ingénieur IA et chercheur en sécurité. Agents IA, développement full-stack et red teaming. Missions internationales.",
  },
  {
    path: "/work/",
    counterpart: "/fr/realisations/",
    locale: "en",
    kind: "work",
    title: `Work | ${siteName}`,
    description:
      "Software, AI, Web, blockchain, and security projects by Gilles Musy.",
  },
  {
    path: "/fr/realisations/",
    counterpart: "/work/",
    locale: "fr",
    kind: "work",
    title: `Réalisations | ${siteName}`,
    description:
      "Réalisations de Gilles Musy en logiciel, IA, Web, blockchain et sécurité.",
  },
  {
    path: "/engineering/",
    counterpart: "/fr/ingenierie/",
    locale: "en",
    kind: "practice",
    practice: "software",
    title: `Freelance full-stack developer | ${siteName}`,
    description:
      "Gilles Musy, freelance full-stack developer: React, TypeScript, Python, PHP, WordPress and custom backend integrations. Working with teams worldwide.",
  },
  {
    path: "/fr/ingenierie/",
    counterpart: "/engineering/",
    locale: "fr",
    kind: "practice",
    practice: "software",
    title: `Développeur full-stack freelance | ${siteName}`,
    description:
      "Gilles Musy, développeur full-stack freelance : React, TypeScript, Python, PHP, WordPress et intégrations backend sur mesure. Missions dans le monde entier.",
  },
  {
    path: "/ai-systems/",
    counterpart: "/fr/systemes-ia/",
    locale: "en",
    kind: "practice",
    practice: "ai",
    title: `Freelance AI engineer, multi-agent systems | ${siteName}`,
    description:
      "Freelance AI engineering by Gilles Musy: Python agents, multi-agent orchestration, API integrations and Talos. Worldwide engagements.",
  },
  {
    path: "/fr/systemes-ia/",
    counterpart: "/ai-systems/",
    locale: "fr",
    kind: "practice",
    practice: "ai",
    title: `Ingénieur IA freelance, systèmes multi-agents | ${siteName}`,
    description:
      "Gilles Musy, ingénieur IA freelance : agents Python, orchestration multi-agent, intégrations API et Talos. Missions dans le monde entier.",
  },
  {
    path: "/security-research/",
    counterpart: "/fr/recherche-securite/",
    locale: "en",
    kind: "practice",
    practice: "security",
    title: `AI agent security and red teaming | ${siteName}`,
    description:
      "Gilles Musy: freelance AI agent security testing, indirect prompt injection (IPI) and red teaming. Web, API and smart contract research. Worldwide.",
  },
  {
    path: "/fr/recherche-securite/",
    counterpart: "/security-research/",
    locale: "fr",
    kind: "practice",
    practice: "security",
    title: `Sécurité des agents IA et red teaming | ${siteName}`,
    description:
      "Gilles Musy : tests de sécurité des agents IA, injection indirecte de prompts (IPI) et red teaming. Recherche Web, API et smart contracts. Freelance international.",
  },
  {
    path: "/writing/",
    counterpart: "/fr/publications/",
    locale: "en",
    kind: "writing",
    title: `Writing | ${siteName}`,
    description:
      "Technical writing by Gilles Musy, including the AI Adoption Playbook.",
  },
  {
    path: "/fr/publications/",
    counterpart: "/writing/",
    locale: "fr",
    kind: "writing",
    title: `Publications | ${siteName}`,
    description:
      "Publications techniques de Gilles Musy, dont le guide AI Adoption Playbook.",
  },
  {
    path: "/about/",
    counterpart: "/fr/a-propos/",
    locale: "en",
    kind: "about",
    title: `About | ${siteName}`,
    description:
      "Why I build software, explore AI, and research security: curiosity, practical experience, and an understanding of their limits.",
  },
  {
    path: "/fr/a-propos/",
    counterpart: "/about/",
    locale: "fr",
    kind: "about",
    title: `À propos | ${siteName}`,
    description:
      "Ce qui m’anime en développement, en IA et en recherche en sécurité : la curiosité, la pratique et la compréhension de leurs limites.",
  },
  {
    path: "/contact/",
    counterpart: "/fr/contact/",
    locale: "en",
    kind: "contact",
    title: `Contact | ${siteName}`,
    description:
      "Contact Gilles Musy (Musyg) for freelance development, AI engineering or security testing. Working with teams worldwide.",
  },
  {
    path: "/fr/contact/",
    counterpart: "/contact/",
    locale: "fr",
    kind: "contact",
    title: `Contact | ${siteName}`,
    description:
      "Contactez Gilles Musy (Musyg) pour une mission freelance en développement, ingénierie IA ou tests de sécurité, partout dans le monde.",
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

export const siteOrigin = "https://musyg.com";

export function canonicalUrl(path: string): string {
  return new URL(path, siteOrigin).toString();
}
