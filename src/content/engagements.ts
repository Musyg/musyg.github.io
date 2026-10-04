import type { Bilingual, Locale, Practice } from "./site";

export const engagementScope: Bilingual = {
  fr: "Basé en Suisse, j’interviens en freelance pour des équipes partout dans le monde.",
  en: "Based in Switzerland, I work with teams worldwide as a freelancer.",
};

interface Engagement {
  title: string;
  introduction: string;
  needs: string[];
  method: string;
  deliverables: string;
  action: string;
}

export const engagements: Record<Practice, Record<Locale, Engagement>> = {
  security: {
    fr: {
      title: "Tests de sécurité des agents IA",
      introduction:
        "Vous cherchez un freelance pour évaluer la sécurité d’un agent connecté à des documents, des API ou des outils ? Je combine la pratique du développement d’agents avec la recherche en sécurité et le red teaming IA.",
      needs: [
        "Injection indirecte de prompts (IPI, indirect prompt injection) : évaluer si un contenu externe non fiable peut détourner les instructions de l’agent.",
        "Abus d’outils et permissions : vérifier les actions accessibles à l’agent, les frontières d’accès et la validation humaine.",
        "Données et intégrations : examiner les risques de divulgation et les échanges entre l’agent et les services métier.",
      ],
      method:
        "Nous définissons le périmètre autorisé, l’environnement et les critères de réussite avant les tests. J’évalue les comportements observés, documente les résultats et les relie aux mesures de protection à mettre en place.",
      deliverables:
        "Selon la mission : plan de tests, constats documentés avec éléments de reproduction, priorités de correction et vérification des correctifs. Les résultats confidentiels restent dans le cadre convenu avec vous.",
      action: "Discuter de la sécurité de vos agents",
    },
    en: {
      title: "AI agent security testing",
      introduction:
        "Looking for a freelance specialist to assess an agent connected to documents, APIs or tools? I combine hands-on agent development with security research and AI red teaming.",
      needs: [
        "Indirect prompt injection (IPI): assess whether untrusted external content can divert an agent from its instructions.",
        "Tool misuse and permissions: review the actions available to the agent, access boundaries and human approval.",
        "Data and integrations: examine disclosure risks and exchanges between the agent and business services.",
      ],
      method:
        "We agree on the authorized scope, environment and success criteria before testing. I evaluate observed behavior, document the results and connect them to protective measures.",
      deliverables:
        "Depending on the engagement: a test plan, documented findings with reproduction evidence, remediation priorities and verification of fixes. Confidential results stay within the agreed scope.",
      action: "Discuss your agents’ security",
    },
  },
  ai: {
    fr: {
      title: "Concevoir et intégrer vos agents IA",
      introduction:
        "Vous cherchez un ingénieur IA freelance pour passer d’une idée à un système utilisable ? Je développe des agents Python et des intégrations adaptés à vos données, vos outils et vos processus.",
      needs: [
        "Relier des agents aux API et aux données métier, avec des permissions définies.",
        "Orchestrer plusieurs agents, gérer leur mémoire et suivre leur exécution.",
        "Évaluer un pilote, ses échecs et sa reprise avant d’élargir son usage.",
      ],
      method:
        "Nous partons du besoin métier et d’un pilote délimité. Je construis les intégrations, définis les contrôles et mesure le comportement du système avec des cas représentatifs.",
      deliverables:
        "Selon la mission : architecture, code et intégrations, tests d’évaluation, documentation d’exploitation et critères de validation du pilote.",
      action: "Discuter de votre projet IA",
    },
    en: {
      title: "Build and integrate your AI agents",
      introduction:
        "Looking for a freelance AI engineer to turn an idea into a usable system? I develop Python agents and integrations tailored to your data, tools and workflows.",
      needs: [
        "Connect agents to business APIs and data with defined permissions.",
        "Orchestrate multiple agents, manage memory and track execution.",
        "Evaluate a pilot, its failures and recovery before expanding its use.",
      ],
      method:
        "We start with the business need and a bounded pilot. I build the integrations, define controls and measure system behavior against representative cases.",
      deliverables:
        "Depending on the engagement: architecture, code and integrations, evaluation tests, operational documentation and pilot acceptance criteria.",
      action: "Discuss your AI project",
    },
  },
  software: {
    fr: {
      title: "Développement web et backend sur mesure",
      introduction:
        "Vous cherchez un développeur full-stack freelance pour une application, un site ou une intégration ? Je travaille sur les interfaces comme sur les services qui les font fonctionner.",
      needs: [
        "Créer ou faire évoluer une interface React et TypeScript avec Vite.",
        "Développer des services Python ou PHP et les relier à vos API métier.",
        "Adapter WordPress, WooCommerce ou Shopify avec des fonctionnalités et intégrations sur mesure.",
      ],
      method:
        "Nous définissons les parcours et les contraintes de votre système existant. Je développe par étapes vérifiables, avec des tests et une préparation du déploiement.",
      deliverables:
        "Selon la mission : code source, interfaces et API, tests, documentation et procédure de déploiement.",
      action: "Discuter de votre projet logiciel",
    },
    en: {
      title: "Custom web and backend development",
      introduction:
        "Looking for a freelance full-stack developer for an application, website or integration? I work on both interfaces and the services behind them.",
      needs: [
        "Build or extend a React and TypeScript interface with Vite.",
        "Develop Python or PHP services and connect them to business APIs.",
        "Extend WordPress, WooCommerce or Shopify with custom features and integrations.",
      ],
      method:
        "We define user journeys and the constraints of your existing system. I develop in verifiable stages, with tests and deployment preparation.",
      deliverables:
        "Depending on the engagement: source code, interfaces and APIs, tests, documentation and a deployment procedure.",
      action: "Discuss your software project",
    },
  },
};
