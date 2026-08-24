export type Locale = "en" | "fr";

export type Practice = "software" | "ai" | "security";

export type ProjectStatus =
  "stable-release" | "public-testnet" | "published-research" | "active-rebuild";

export type ProjectFilter = "all" | Practice | "web" | "blockchain";

export type SectionKey =
  | "summary"
  | "role"
  | "problem"
  | "architecture"
  | "decisions"
  | "security"
  | "testing"
  | "results"
  | "evidence"
  | "limitations";

export interface Bilingual {
  en: string;
  fr: string;
}

export interface PublicLink {
  label: Bilingual;
  url: string;
}

export interface Project {
  id: string;
  slug: Bilingual;
  title: string;
  summary: Bilingual;
  role: Bilingual;
  status: ProjectStatus;
  practice: Practice;
  filters: ProjectFilter[];
  date: string;
  stack: string[];
  sections: Record<SectionKey, { en: string[]; fr: string[] }>;
  links: PublicLink[];
}

export const sectionOrder: SectionKey[] = [
  "summary",
  "role",
  "problem",
  "architecture",
  "decisions",
  "security",
  "testing",
  "results",
  "evidence",
  "limitations",
];

export const sectionLabels: Record<SectionKey, Bilingual> = {
  summary: { en: "Summary", fr: "Présentation" },
  role: { en: "Role and scope", fr: "Rôle et périmètre" },
  problem: { en: "Problem and constraints", fr: "Problème et contraintes" },
  architecture: { en: "Architecture", fr: "Architecture" },
  decisions: { en: "Decisions and trade-offs", fr: "Choix et compromis" },
  security: { en: "Security context", fr: "Contexte de sécurité" },
  testing: { en: "Testing and verification", fr: "Tests et vérification" },
  results: { en: "Public results", fr: "Résultats publics" },
  evidence: { en: "Public evidence", fr: "Preuves publiques" },
  limitations: { en: "Remaining limitations", fr: "Limites restantes" },
};

export const statusLabels: Record<ProjectStatus, Bilingual> = {
  "stable-release": { en: "Stable release", fr: "Version stable" },
  "public-testnet": {
    en: "Public testnet reference",
    fr: "Référence publique sur testnet",
  },
  "published-research": {
    en: "Published research",
    fr: "Recherche publiée",
  },
  "active-rebuild": { en: "Active rebuild", fr: "Refonte en cours" },
};

export const practiceLabels: Record<Practice, Bilingual> = {
  software: { en: "Software engineering", fr: "Ingénierie logicielle" },
  ai: { en: "Agentic AI engineering", fr: "Ingénierie IA agentique" },
  security: { en: "Security research", fr: "Recherche en sécurité" },
};

export const filterLabels: Record<ProjectFilter, Bilingual> = {
  all: { en: "All work", fr: "Toutes les réalisations" },
  software: { en: "Software", fr: "Logiciel" },
  ai: { en: "AI systems", fr: "Systèmes IA" },
  security: { en: "Security", fr: "Sécurité" },
  web: { en: "Web", fr: "Web" },
  blockchain: { en: "Blockchain", fr: "Blockchain" },
};

export const projects: Project[] = [
  {
    id: "celo-credentials",
    slug: { en: "celo-credentials", fr: "celo-credentials" },
    title: "Celo Credentials",
    summary: {
      en: "Gasless, non-transferable education credentials with public on-chain verification and revocation.",
      fr: "Attestations de formation non transférables, sans frais pour le bénéficiaire, avec vérification et révocation publiques sur la blockchain.",
    },
    role: {
      en: "Full-stack architecture and implementation",
      fr: "Architecture et réalisation full-stack",
    },
    status: "public-testnet",
    practice: "software",
    filters: ["software", "blockchain"],
    date: "2026-08-16",
    stack: [
      "Solidity",
      "Foundry",
      "Express",
      "PostgreSQL",
      "Next.js",
      "wagmi",
      "viem",
      "TypeScript",
    ],
    sections: {
      summary: {
        en: [
          "Celo Credentials is a full-stack reference application for gasless, non-transferable education credentials. Institutions sign EIP-712 vouchers off-chain, a relayer pays the gas, and credentials remain publicly verifiable and revocable on Celo.",
        ],
        fr: [
          "Celo Credentials est une application de référence full-stack pour des attestations de formation non transférables et sans frais pour leur bénéficiaire. Les établissements signent des autorisations EIP-712 hors chaîne, un relais paie les frais et les attestations restent vérifiables et révocables publiquement sur Celo.",
        ],
      },
      role: {
        en: [
          "Gilles Musy designed and implemented the smart contract, deployment path, relayer backend, indexer boundary, frontend integration, tests, and public evidence manifest.",
        ],
        fr: [
          "Gilles Musy a conçu et réalisé le smart contract, le parcours de déploiement, le backend de relais, la limite de l’indexeur, l’intégration frontend, les tests et le manifeste de preuves publiques.",
        ],
      },
      problem: {
        en: [
          "A recipient should receive a verifiable credential without holding funds, while the system still enforces issuer authorization, replay protection, expiry, non-transferability, and revocation.",
        ],
        fr: [
          "Un bénéficiaire doit pouvoir recevoir une attestation vérifiable sans détenir de fonds, tout en conservant l’autorisation des émetteurs, la protection contre le rejeu et l’expiration, la non-transférabilité et la révocation.",
        ],
      },
      architecture: {
        en: [
          "A Foundry-tested Solidity contract validates EIP-712 vouchers. An Express and viem relayer submits transactions, PostgreSQL supports indexing, and a Next.js interface provides connection, issuance, listing, and verification flows.",
        ],
        fr: [
          "Un contrat Solidity testé avec Foundry valide les autorisations EIP-712. Un relais Express et viem soumet les transactions, PostgreSQL prend en charge l’indexation et une interface Next.js fournit les parcours de connexion, d’émission, de liste et de vérification.",
        ],
      },
      decisions: {
        en: [
          "Gas sponsorship stays in a separate relayer, credentials cannot be transferred, nonces are single use, deadlines expire, and revocation is limited to the contract owner or the still-authorized original issuer.",
        ],
        fr: [
          "La prise en charge des frais reste dans un relais séparé, les attestations ne peuvent pas être transférées, les nonces sont à usage unique, les échéances expirent et la révocation est limitée au propriétaire du contrat ou à l’émetteur d’origine encore autorisé.",
        ],
      },
      security: {
        en: [
          "These controls are security design for a self-authored application. They are not presented as an external audit of the system.",
        ],
        fr: [
          "Ces contrôles relèvent de la conception de la sécurité d’une application réalisée par son auteur. Ils ne sont pas présentés comme un audit externe du système.",
        ],
      },
      testing: {
        en: [
          "The public repository reports 11/11 Foundry tests covering minting, soulbound behavior, replay and expiry rejection, unauthorized signers, issuer-bound revocation paths, and fuzzing. CI also validates backend dependencies and the production frontend build.",
        ],
        fr: [
          "Le dépôt public présente 11 tests Foundry réussis sur 11 pour l’émission, la non-transférabilité, le rejet du rejeu et de l’expiration, les signataires non autorisés, les parcours de révocation liés à l’émetteur et le fuzzing. La CI contrôle aussi les dépendances backend et la construction frontend de production.",
        ],
      },
      results: {
        en: [
          "The source-verified Celo Sepolia deployment demonstrates issuer authorization, credential issuance, active read-back, and final revocation through public transactions and chain state.",
        ],
        fr: [
          "Le déploiement Celo Sepolia au code source vérifié démontre l’autorisation d’un émetteur, l’émission d’une attestation, sa lecture à l’état actif et sa révocation finale au moyen de transactions et d’un état publics.",
        ],
      },
      evidence: {
        en: [
          "The repository, verified contract, deployment transaction, lifecycle transactions, and machine-readable deployment manifest are public.",
        ],
        fr: [
          "Le dépôt, le contrat vérifié, la transaction de déploiement, les transactions du cycle de vie et le manifeste de déploiement lisible par machine sont publics.",
        ],
      },
      limitations: {
        en: [
          "This is a public testnet reference implementation. It has not been externally audited for production use.",
        ],
        fr: [
          "Il s’agit d’une implémentation de référence publique sur testnet. Elle n’a pas fait l’objet d’un audit externe pour un usage en production.",
        ],
      },
    },
    links: [
      {
        label: { en: "Public repository", fr: "Dépôt public" },
        url: "https://github.com/Musyg/celo-credentials-dapp",
      },
      {
        label: { en: "Verified contract", fr: "Contrat vérifié" },
        url: "https://celo-sepolia.blockscout.com/address/0xCE6A729c96C6c5f61d90E0139bCF929A777CCAC7",
      },
    ],
  },
  {
    id: "security-reviews",
    slug: { en: "security-reviews", fr: "security-reviews" },
    title: "Security Reviews",
    summary: {
      en: "A public catalogue of reproducible smart-contract and applied-security research.",
      fr: "Un catalogue public de travaux reproductibles sur les smart contracts et la sécurité appliquée.",
    },
    role: {
      en: "Security research, exploit reproduction, remediation, and reporting",
      fr: "Recherche en sécurité, reproduction d’exploits, correction et rapports",
    },
    status: "published-research",
    practice: "security",
    filters: ["security", "blockchain"],
    date: "2026-08-24",
    stack: [
      "Solidity",
      "Vyper",
      "Foundry",
      "Circom",
      "Groth16",
      "Halmos",
      "GitHub Actions",
    ],
    sections: {
      summary: {
        en: [
          "Security Reviews groups public, reproducible research by vulnerability class. Each review links a vulnerable target, an exploit proof of concept, a remediated branch, a report, and automated checks.",
        ],
        fr: [
          "Security Reviews regroupe des recherches publiques et reproductibles par classe de vulnérabilité. Chaque revue relie une cible vulnérable, une preuve de concept d’exploitation, une branche corrigée, un rapport et des contrôles automatisés.",
        ],
      },
      role: {
        en: [
          "Gilles Musy reproduces the vulnerable behavior, documents impact and assumptions, implements or explains remediation, and keeps the evidence runnable in CI.",
        ],
        fr: [
          "Gilles Musy reproduit le comportement vulnérable, documente l’impact et les hypothèses, met en œuvre ou explique la correction et maintient les preuves exécutables en CI.",
        ],
      },
      problem: {
        en: [
          "A written finding is difficult to evaluate when the vulnerable state, exploit path, fixed behavior, and assumptions cannot be reproduced independently.",
        ],
        fr: [
          "Un constat écrit reste difficile à évaluer lorsque l’état vulnérable, le parcours d’exploitation, le comportement corrigé et les hypothèses ne peuvent pas être reproduits.",
        ],
      },
      architecture: {
        en: [
          "The catalogue uses one public repository per vulnerability class. Reports, source, exploit tests, fixed branches, and CI remain close enough to compare without hiding the technical path behind a summary page.",
        ],
        fr: [
          "Le catalogue utilise un dépôt public par classe de vulnérabilité. Les rapports, le code source, les tests d’exploitation, les branches corrigées et la CI restent suffisamment proches pour être comparés sans masquer le parcours technique derrière une page de synthèse.",
        ],
      },
      decisions: {
        en: [
          "The portfolio names the vulnerability classes and public programs involved, but does not publish private report details, unsupported severity claims, or finding counts as a credibility shortcut.",
        ],
        fr: [
          "Le portfolio nomme les classes de vulnérabilités et les programmes publics concernés, mais ne publie ni détails privés, ni gravité non étayée, ni nombre de constats comme raccourci de crédibilité.",
        ],
      },
      security: {
        en: [
          "The research covers Web and application security, Solidity and Vyper contracts, ZK circuits, formal verification, and indirect prompt injection. Public platform associations include the Treasury Board of Canada Secretariat, Reserve Protocol, Revert Finance, Chainlink Payment Abstraction V2, and K2.",
        ],
        fr: [
          "Les recherches couvrent la sécurité Web et applicative, les contrats Solidity et Vyper, les circuits ZK, la vérification formelle et l’injection indirecte de prompts. Les associations publiques comprennent le Secrétariat du Conseil du Trésor du Canada, Reserve Protocol, Revert Finance, Chainlink Payment Abstraction V2 et K2.",
        ],
      },
      testing: {
        en: [
          "Public repositories include executable exploit and remediation checks using the tool appropriate to each target, including Foundry, Halmos, Circom, and GitHub Actions.",
        ],
        fr: [
          "Les dépôts publics comprennent des contrôles exécutables de l’exploitation et de la correction avec l’outil adapté à chaque cible, notamment Foundry, Halmos, Circom et GitHub Actions.",
        ],
      },
      results: {
        en: [
          "Published examples cover share inflation, signature replay, reward accounting drift, oracle freshness, reentrancy, fee rounding, access control, under-constrained circuits, and arithmetic verification.",
        ],
        fr: [
          "Les exemples publiés couvrent l’inflation de parts, le rejeu de signatures, la dérive de comptabilisation des récompenses, la fraîcheur des oracles, la réentrance, l’arrondi des frais, le contrôle d’accès, les circuits sous-contraints et la vérification arithmétique.",
        ],
      },
      evidence: {
        en: [
          "The catalogue and linked repositories are public. HackerOne, Gray Swan Arena, Cantina, and Code4rena provide separate public professional profiles.",
        ],
        fr: [
          "Le catalogue et les dépôts liés sont publics. HackerOne, Gray Swan Arena, Cantina et Code4rena fournissent des profils professionnels publics distincts.",
        ],
      },
      limitations: {
        en: [
          "Only attributable public evidence appears here. Private submissions, unpublished technical details, and non-public program information remain excluded.",
        ],
        fr: [
          "Seules les preuves publiques et attribuables apparaissent ici. Les soumissions privées, les détails techniques non publiés et les informations non publiques des programmes restent exclus.",
        ],
      },
    },
    links: [
      {
        label: {
          en: "Security Reviews catalogue",
          fr: "Catalogue Security Reviews",
        },
        url: "https://github.com/Musyg/security-reviews",
      },
      {
        label: { en: "HackerOne profile", fr: "Profil HackerOne" },
        url: "https://hackerone.com/gilmu",
      },
    ],
  },
  {
    id: "agent-resilience",
    slug: { en: "agent-resilience", fr: "agent-resilience" },
    title: "Agent Resilience",
    summary: {
      en: "Reusable failure-handling components for distributed agent systems.",
      fr: "Composants réutilisables de gestion des pannes pour les systèmes d’agents distribués.",
    },
    role: {
      en: "Python package design, implementation, tests, and release",
      fr: "Conception du package Python, réalisation, tests et publication",
    },
    status: "stable-release",
    practice: "ai",
    filters: ["ai", "software"],
    date: "2026-08-13",
    stack: ["Python", "Redis", "MQTT", "pytest", "GitHub Actions"],
    sections: {
      summary: {
        en: [
          "Agent Resilience packages a circuit breaker, a Redis-backed dead-letter queue, and an offline MQTT buffer for agent and service workloads that cannot assume every dependency is available.",
        ],
        fr: [
          "Agent Resilience regroupe un circuit breaker, une file de messages en échec adossée à Redis et un tampon MQTT hors ligne pour des agents et services qui ne peuvent pas supposer que chaque dépendance reste disponible.",
        ],
      },
      role: {
        en: [
          "Gilles Musy designed the package interfaces, implemented the failure modes, wrote the tests and usage examples, configured packaging and CI, and published v0.1.0.",
        ],
        fr: [
          "Gilles Musy a conçu les interfaces du package, réalisé les modes de panne, écrit les tests et exemples d’utilisation, configuré le packaging et la CI, puis publié la version v0.1.0.",
        ],
      },
      problem: {
        en: [
          "Distributed agents need predictable behavior when an API fails repeatedly, a broker is offline, or a message cannot be processed immediately.",
        ],
        fr: [
          "Les agents distribués ont besoin d’un comportement prévisible lorsqu’une API échoue à répétition, qu’un broker est hors ligne ou qu’un message ne peut pas être traité immédiatement.",
        ],
      },
      architecture: {
        en: [
          "The components remain independent and composable. The circuit breaker controls repeated calls, the dead-letter queue retains failed work in Redis, and the MQTT buffer stores outbound messages until connectivity returns.",
        ],
        fr: [
          "Les composants restent indépendants et composables. Le circuit breaker contrôle les appels répétés, la file de messages en échec conserve le travail dans Redis et le tampon MQTT stocke les messages sortants jusqu’au retour de la connexion.",
        ],
      },
      decisions: {
        en: [
          "The package favors explicit state and small integration surfaces. It provides building blocks rather than imposing an agent framework or hiding recovery behind global process state.",
        ],
        fr: [
          "Le package privilégie des états explicites et de petites surfaces d’intégration. Il fournit des composants plutôt que d’imposer un framework d’agents ou de masquer la reprise derrière un état global du processus.",
        ],
      },
      security: {
        en: [
          "This project demonstrates reliability engineering for agent infrastructure. It is not presented as a security audit or as proof that an integrated application is secure.",
        ],
        fr: [
          "Ce projet démontre une ingénierie de fiabilité pour l’infrastructure d’agents. Il n’est pas présenté comme un audit de sécurité ni comme la preuve qu’une application intégrée est sécurisée.",
        ],
      },
      testing: {
        en: [
          "The public release includes automated tests, package builds, and CI across the supported Python versions.",
        ],
        fr: [
          "La version publique comprend des tests automatisés, la construction du package et une CI couvrant les versions de Python prises en charge.",
        ],
      },
      results: {
        en: [
          "Version v0.1.0 is publicly released with documented installation and examples for each resilience component.",
        ],
        fr: [
          "La version v0.1.0 est publiée avec une installation documentée et des exemples pour chaque composant de résilience.",
        ],
      },
      evidence: {
        en: [
          "The source repository, release, package metadata, tests, and CI configuration are public.",
        ],
        fr: [
          "Le dépôt source, la release, les métadonnées du package, les tests et la configuration de CI sont publics.",
        ],
      },
      limitations: {
        en: [
          "These are integration components, not a complete agent platform. Production users must select persistence, retry, monitoring, and operational policies for their own environment.",
        ],
        fr: [
          "Il s’agit de composants d’intégration, pas d’une plateforme d’agents complète. Les utilisateurs en production doivent choisir les politiques de persistance, de nouvelle tentative, de supervision et d’exploitation adaptées à leur environnement.",
        ],
      },
    },
    links: [
      {
        label: { en: "Public repository", fr: "Dépôt public" },
        url: "https://github.com/Musyg/agent-resilience",
      },
      {
        label: { en: "Release v0.1.0", fr: "Release v0.1.0" },
        url: "https://github.com/Musyg/agent-resilience/releases/tag/v0.1.0",
      },
    ],
  },
  {
    id: "inaricom",
    slug: { en: "inaricom", fr: "inaricom" },
    title: "Inaricom",
    summary: {
      en: "A hybrid WordPress, WooCommerce, PHP, REST, React, and Vite rebuild in progress.",
      fr: "Une refonte en cours associant WordPress, WooCommerce, PHP, REST, React et Vite.",
    },
    role: {
      en: "Website and backend development",
      fr: "Développement du site et du backend",
    },
    status: "active-rebuild",
    practice: "software",
    filters: ["software", "web"],
    date: "2026-08-24",
    stack: [
      "WordPress",
      "WooCommerce",
      "PHP",
      "REST",
      "React 19",
      "TypeScript",
      "Vite",
    ],
    sections: {
      summary: {
        en: [
          "Inaricom is a business, services, publishing, and commerce site under active rebuild. The implementation keeps WordPress and WooCommerce as the publishing and commerce backend while adding page-specific React interfaces.",
        ],
        fr: [
          "Inaricom est un site professionnel de services, de publication et de commerce en cours de refonte. L’implémentation conserve WordPress et WooCommerce comme backend éditorial et commercial tout en ajoutant des interfaces React propres à chaque page.",
        ],
      },
      role: {
        en: [
          "Gilles Musy is responsible for the website and backend development, including the WordPress structure, WooCommerce integration, custom PHP and REST layer, React interfaces, content paths, and deployment work.",
        ],
        fr: [
          "Gilles Musy prend en charge le développement du site et du backend, notamment la structure WordPress, l’intégration WooCommerce, la couche PHP et REST dédiée, les interfaces React, les parcours de contenu et le déploiement.",
        ],
      },
      problem: {
        en: [
          "The rebuild must combine service content, technical publishing, contact and quote paths, and e-commerce without replacing the established content and commerce backend with an unnecessary custom engine.",
        ],
        fr: [
          "La refonte doit réunir les contenus de services, la publication technique, les parcours de contact et de devis ainsi que l’e-commerce sans remplacer le backend éditorial et commercial par un moteur sur mesure inutile.",
        ],
      },
      architecture: {
        en: [
          "A custom PHP plugin defines content models, taxonomies, structured data, REST endpoints, and conditional React mount points. Vite builds page-specific React 19 and TypeScript interfaces while WooCommerce retains catalogue and purchase flows.",
        ],
        fr: [
          "Une extension PHP dédiée définit les modèles de contenu, les taxonomies, les données structurées, les points d’accès REST et les points de montage conditionnels de React. Vite construit des interfaces React 19 et TypeScript propres à chaque page, tandis que WooCommerce conserve le catalogue et les parcours d’achat.",
        ],
      },
      decisions: {
        en: [
          "React is loaded only where an interface needs it. Classic WordPress and WooCommerce pages remain available, and the custom layer focuses on services, content, structured data, and interactions rather than reimplementing commerce.",
        ],
        fr: [
          "React n’est chargé que lorsqu’une interface en a besoin. Les pages WordPress et WooCommerce classiques restent disponibles et la couche dédiée se concentre sur les services, les contenus, les données structurées et les interactions plutôt que de réimplémenter le commerce.",
        ],
      },
      security: {
        en: [
          "This is a Web development case study. Security controls applied during implementation remain engineering work, and the project is not presented as having received an external security audit.",
        ],
        fr: [
          "Il s’agit d’une étude de cas de développement Web. Les contrôles de sécurité appliqués pendant la réalisation restent des travaux d’ingénierie et le projet n’est pas présenté comme ayant reçu un audit de sécurité externe.",
        ],
      },
      testing: {
        en: [
          "The public portfolio records only architecture already described publicly. End-to-end verification of the rebuilt site remains pending until the public relaunch.",
        ],
        fr: [
          "Le portfolio public reprend uniquement l’architecture déjà décrite publiquement. La vérification de bout en bout de la nouvelle version reste en attente jusqu’à la remise en ligne.",
        ],
      },
      results: {
        en: [
          "The current hybrid architecture and contributor scope are documented. On 2026-08-24 the public URL still returned HTTP 503, which matches the active construction state rather than a completed release.",
        ],
        fr: [
          "L’architecture hybride actuelle et le périmètre de contribution sont documentés. Le 24 août 2026, l’URL publique répondait encore en HTTP 503, ce qui correspond à l’état de construction et non à une version terminée.",
        ],
      },
      evidence: {
        en: [
          "The project URL and bilingual public GitHub case study provide the attributable public evidence. No private source is copied into this portfolio.",
        ],
        fr: [
          "L’URL du projet et l’étude de cas GitHub publique et bilingue constituent les preuves publiques attribuables. Aucun code source privé n’est copié dans ce portfolio.",
        ],
      },
      limitations: {
        en: [
          "The rebuild is not a completed public release. Sales, traffic, infrastructure credentials, private source, and non-public business material are not exposed or claimed.",
        ],
        fr: [
          "La refonte n’est pas une version publique terminée. Les ventes, l’audience, les identifiants d’infrastructure, le code source privé et les documents commerciaux non publics ne sont ni exposés ni revendiqués.",
        ],
      },
    },
    links: [
      {
        label: { en: "Project URL", fr: "URL du projet" },
        url: "https://inaricom.com",
      },
      {
        label: { en: "Public case study", fr: "Étude de cas publique" },
        url: "https://github.com/Musyg/Musyg/blob/main/case-studies/en/inaricom.md",
      },
    ],
  },
  {
    id: "mikasshop",
    slug: { en: "mikasshop", fr: "mikasshop" },
    title: "Mika's Shop",
    summary: {
      en: "End-to-end Shopify store design and implementation for cat and pet products.",
      fr: "Conception et réalisation complète d’une boutique Shopify consacrée aux chats et aux animaux de compagnie.",
    },
    role: {
      en: "Sole contributor for the Shopify store scope",
      fr: "Seul intervenant sur le périmètre de la boutique Shopify",
    },
    status: "stable-release",
    practice: "software",
    filters: ["software", "web"],
    date: "2026-08-14",
    stack: [
      "Shopify",
      "Liquid theme configuration",
      "Shopify Markets",
      "Multilingual content",
    ],
    sections: {
      summary: {
        en: [
          "Mika's Shop is a public Shopify store for cat and pet products. Its merchandising helps visitors browse by cat profile as well as by ordinary product category.",
        ],
        fr: [
          "Mika's Shop est une boutique Shopify publique consacrée aux produits pour chats et animaux de compagnie. Son marchandisage aide les visiteurs à parcourir le catalogue selon le profil du chat ainsi que par catégorie de produits.",
        ],
      },
      role: {
        en: [
          "Gilles Musy designed and implemented the full Shopify storefront scope, including structure, theme composition, navigation, collections, products, localization, purchase paths, policies, editorial content, and public launch.",
        ],
        fr: [
          "Gilles Musy a conçu et réalisé l’ensemble du périmètre de la vitrine Shopify, notamment la structure, la composition du thème, la navigation, les collections, les produits, la localisation, les parcours d’achat, les politiques, les contenus éditoriaux et la mise en ligne.",
        ],
      },
      problem: {
        en: [
          "The store needed a clear way to match products to different cat behaviors while still preserving a familiar, localized e-commerce journey.",
        ],
        fr: [
          "La boutique devait proposer une manière claire d’associer les produits à différents comportements de chats tout en conservant un parcours e-commerce familier et localisé.",
        ],
      },
      architecture: {
        en: [
          "Shopify provides hosted commerce, catalogue, localization, cart, and checkout. The storefront theme organizes collections by product type and cat profile, multilingual content, editorial pages, and customer information.",
        ],
        fr: [
          "Shopify fournit le commerce hébergé, le catalogue, la localisation, le panier et le passage en caisse. Le thème de la vitrine organise les collections par type de produit et profil de chat, les contenus multilingues, les pages éditoriales et les informations clients.",
        ],
      },
      decisions: {
        en: [
          "Using Shopify avoids an unnecessary custom backend. The implementation concentrates on information architecture, product discovery, localization, and a consistent purchase path.",
        ],
        fr: [
          "L’utilisation de Shopify évite un backend sur mesure inutile. La réalisation se concentre sur l’architecture de l’information, la découverte des produits, la localisation et un parcours d’achat cohérent.",
        ],
      },
      security: {
        en: [
          "Checkout and payment processing use Shopify-managed flows. This case study does not claim a custom payment system or an external security audit.",
        ],
        fr: [
          "Le passage en caisse et le traitement des paiements utilisent les parcours gérés par Shopify. Cette étude de cas ne revendique ni système de paiement personnalisé ni audit de sécurité externe.",
        ],
      },
      testing: {
        en: [
          "Public verification covered the homepage, product, brand, blog, guide, localization, cart-related controls, shipping information, returns information, and policy paths. No test purchase was made.",
        ],
        fr: [
          "La vérification publique a couvert l’accueil, les produits, la marque, le blog, le guide, la localisation, les contrôles liés au panier, la livraison, les retours et les politiques. Aucun achat de test n’a été effectué.",
        ],
      },
      results: {
        en: [
          "The public store is live with English, French, and German content, localized regions and currencies, product collections, editorial content, and a downloadable adoption guide.",
        ],
        fr: [
          "La boutique publique est en ligne avec des contenus en anglais, français et allemand, des régions et devises localisées, des collections de produits, des contenus éditoriaux et un guide d’adoption téléchargeable.",
        ],
      },
      evidence: {
        en: [
          "The live storefront and public bilingual GitHub case study provide the evidence for the implemented scope.",
        ],
        fr: [
          "La boutique en ligne et l’étude de cas GitHub publique et bilingue fournissent les preuves du périmètre réalisé.",
        ],
      },
      limitations: {
        en: [
          "Sales, conversion, traffic, and revenue are not public and are not claimed. Products, prices, and storefront content can change. Shopify remains the commerce backend.",
        ],
        fr: [
          "Les ventes, la conversion, l’audience et le chiffre d’affaires ne sont pas publics et ne sont pas revendiqués. Les produits, les prix et les contenus peuvent évoluer. Shopify reste le backend commercial.",
        ],
      },
    },
    links: [
      {
        label: { en: "Live store", fr: "Boutique publique" },
        url: "https://mikasshop.com",
      },
      {
        label: { en: "Public case study", fr: "Étude de cas publique" },
        url: "https://github.com/Musyg/Musyg/blob/main/case-studies/en/mikasshop.md",
      },
    ],
  },
  {
    id: "pedi-sense",
    slug: { en: "pedi-sense", fr: "pedi-sense" },
    title: "Pedi-Sense",
    summary: {
      en: "End-to-end Shopify store design and implementation for toe-separator socks.",
      fr: "Conception et réalisation complète d’une boutique Shopify de chaussettes séparatrices d’orteils.",
    },
    role: {
      en: "Sole contributor for the Shopify store scope",
      fr: "Seul intervenant sur le périmètre de la boutique Shopify",
    },
    status: "stable-release",
    practice: "software",
    filters: ["software", "web"],
    date: "2026-08-14",
    stack: [
      "Shopify",
      "Liquid theme configuration",
      "Shopify Markets",
      "Localized metadata",
    ],
    sections: {
      summary: {
        en: [
          "Pedi-Sense is a public Shopify store centered on toe-separator socks. It combines a focused product journey, color and bundle choices, brand content, support information, and localized editorial pages.",
        ],
        fr: [
          "Pedi-Sense est une boutique Shopify publique centrée sur les chaussettes séparatrices d’orteils. Elle réunit un parcours produit ciblé, des choix de couleurs et de lots, des contenus de marque, des informations d’assistance et des pages éditoriales localisées.",
        ],
      },
      role: {
        en: [
          "Gilles Musy designed and implemented the complete Shopify storefront scope, including theme composition, navigation, product options, localization, cart and account paths, policies, FAQ, content, metadata, and launch.",
        ],
        fr: [
          "Gilles Musy a conçu et réalisé l’ensemble du périmètre de la vitrine Shopify, notamment la composition du thème, la navigation, les options produit, la localisation, les parcours de panier et de compte, les politiques, la FAQ, les contenus, les métadonnées et la mise en ligne.",
        ],
      },
      problem: {
        en: [
          "A focused catalogue needs enough structure for product variants, bundle options, practical information, customer support, localization, and editorial content without obscuring the purchase path.",
        ],
        fr: [
          "Un catalogue ciblé a besoin d’une structure suffisante pour les variantes, les offres par lot, les informations pratiques, l’assistance, la localisation et les contenus éditoriaux sans masquer le parcours d’achat.",
        ],
      },
      architecture: {
        en: [
          "Shopify provides hosted catalogue, localization, account, cart, and checkout services. The storefront theme presents product options, bundle choices, brand and support pages, blog content, and localized search metadata.",
        ],
        fr: [
          "Shopify fournit le catalogue hébergé, la localisation, le compte, le panier et le passage en caisse. Le thème de la vitrine présente les options produit, les offres par lot, les pages de marque et d’assistance, le blog et les métadonnées de recherche localisées.",
        ],
      },
      decisions: {
        en: [
          "The hosted commerce backend keeps product, order, localization, and checkout operations within standard Shopify flows. The custom work remains focused on presentation, content, navigation, and localized customer journeys.",
        ],
        fr: [
          "Le backend commercial hébergé conserve les produits, les commandes, la localisation et le passage en caisse dans les parcours standards de Shopify. Le travail réalisé se concentre sur la présentation, les contenus, la navigation et les parcours clients localisés.",
        ],
      },
      security: {
        en: [
          "Payments and checkout remain Shopify-managed. This development case study does not claim a custom payment service, an external security audit, or independent validation of product and health statements.",
        ],
        fr: [
          "Les paiements et le passage en caisse restent gérés par Shopify. Cette étude de cas de développement ne revendique ni service de paiement personnalisé, ni audit de sécurité externe, ni validation des affirmations relatives au produit ou à la santé.",
        ],
      },
      testing: {
        en: [
          "Public verification covered the home, product, brand, FAQ, contact, policy, blog, language, region, product-option, cart, and metadata surfaces. No test purchase was made.",
        ],
        fr: [
          "La vérification publique a couvert l’accueil, le produit, la marque, la FAQ, le contact, les politiques, le blog, les langues, les régions, les options produit, le panier et les métadonnées. Aucun achat de test n’a été effectué.",
        ],
      },
      results: {
        en: [
          "The live store presents a complete purchase journey in French, English, German, Italian, and Spanish, with localized regions, currencies, product choices, customer information, and editorial content.",
        ],
        fr: [
          "La boutique en ligne présente un parcours d’achat complet en français, anglais, allemand, italien et espagnol, avec des régions, devises, choix de produits, informations clients et contenus éditoriaux localisés.",
        ],
      },
      evidence: {
        en: [
          "The live storefront and public bilingual GitHub case study provide the evidence for the implemented scope.",
        ],
        fr: [
          "La boutique en ligne et l’étude de cas GitHub publique et bilingue fournissent les preuves du périmètre réalisé.",
        ],
      },
      limitations: {
        en: [
          "Sales, conversion, traffic, and revenue are not public and are not claimed. Product effects and customer statements are not treated as verified evidence. Shopify remains the commerce backend.",
        ],
        fr: [
          "Les ventes, la conversion, l’audience et le chiffre d’affaires ne sont pas publics et ne sont pas revendiqués. Les effets du produit et les témoignages clients ne sont pas considérés comme des preuves vérifiées. Shopify reste le backend commercial.",
        ],
      },
    },
    links: [
      {
        label: { en: "Live store", fr: "Boutique publique" },
        url: "https://pedi-sense.com",
      },
      {
        label: { en: "Public case study", fr: "Étude de cas publique" },
        url: "https://github.com/Musyg/Musyg/blob/main/case-studies/en/pedi-sense.md",
      },
    ],
  },
];

export const professionalProfiles: Array<{
  name: string;
  handle: string;
  association: Bilingual;
  url: string;
}> = [
  {
    name: "GitHub",
    handle: "Musyg",
    association: {
      en: "Public repositories and releases",
      fr: "Dépôts publics et releases",
    },
    url: "https://github.com/Musyg",
  },
  {
    name: "Gray Swan Arena",
    handle: "GilMu",
    association: {
      en: "Indirect prompt injection research and adversarial AI evaluation",
      fr: "Recherche sur l’injection indirecte de prompts et évaluation adversariale de l’IA",
    },
    url: "https://app.grayswan.ai/arena/user/6a3043c8221a153764c96ab5",
  },
  {
    name: "HackerOne",
    handle: "@gilmu",
    association: {
      en: "Treasury Board of Canada Secretariat",
      fr: "Secrétariat du Conseil du Trésor du Canada",
    },
    url: "https://hackerone.com/gilmu",
  },
  {
    name: "Cantina",
    handle: "@GilMu",
    association: {
      en: "Reserve Protocol and Revert Finance",
      fr: "Reserve Protocol et Revert Finance",
    },
    url: "https://cantina.xyz/u/GilMu",
  },
  {
    name: "Code4rena",
    handle: "@GiMu84",
    association: {
      en: "Chainlink Payment Abstraction V2 and K2",
      fr: "Chainlink Payment Abstraction V2 et K2",
    },
    url: "https://code4rena.com/@GiMu84",
  },
];

export const practicePages: Record<
  Practice,
  {
    title: Bilingual;
    lead: Bilingual;
    capabilities: { en: string[]; fr: string[] };
    projectIds: string[];
    evidence: { en: string[]; fr: string[] };
  }
> = {
  software: {
    title: { en: "Software engineering", fr: "Ingénierie logicielle" },
    lead: {
      en: "Backend, infrastructure, Web, product, blockchain, and open-source systems with explicit operational boundaries.",
      fr: "Backend, infrastructure, Web, produit, blockchain et systèmes open source avec des limites opérationnelles explicites.",
    },
    capabilities: {
      en: [
        "Backend APIs, asynchronous services, integrations, and observability",
        "React and TypeScript interfaces connected to existing platforms",
        "WordPress, WooCommerce, Shopify, and localized commerce paths",
        "Smart-contract applications and public testnet deployments",
        "Packaging, CI, release engineering, and operational documentation",
      ],
      fr: [
        "API backend, services asynchrones, intégrations et observabilité",
        "Interfaces React et TypeScript reliées à des plateformes existantes",
        "WordPress, WooCommerce, Shopify et parcours commerciaux localisés",
        "Applications de smart contracts et déploiements publics sur testnet",
        "Packaging, CI, publication de versions et documentation d’exploitation",
      ],
    },
    projectIds: ["celo-credentials", "inaricom", "mikasshop", "pedi-sense"],
    evidence: {
      en: [
        "Source-verified Celo Sepolia deployment and reproducible lifecycle",
        "Public Shopify storefronts with bilingual case studies",
        "Published Python packages, releases, tests, and CI",
        "Inaricom architecture documented with an active-rebuild limitation",
      ],
      fr: [
        "Déploiement Celo Sepolia au code source vérifié et cycle reproductible",
        "Boutiques Shopify publiques avec études de cas bilingues",
        "Packages Python, releases, tests et CI publics",
        "Architecture Inaricom documentée avec la limite de la refonte en cours",
      ],
    },
  },
  ai: {
    title: { en: "Agentic AI engineering", fr: "Ingénierie IA agentique" },
    lead: {
      en: "Agent orchestration, local-model operations, memory, resilience, observability, and evidence-led adoption.",
      fr: "Orchestration d’agents, exploitation de modèles locaux, mémoire, résilience, observabilité et adoption fondée sur des preuves.",
    },
    capabilities: {
      en: [
        "Capability-based multi-agent routing and tool-enabled workflows",
        "Circuit breakers, dead-letter queues, offline buffers, and recovery",
        "Local LLM routing, GGUF operations, and resource-aware model loading",
        "Graph and vector memory, event buses, and real-time interaction",
        "Pilot design, controls, evidence, and governance for AI adoption",
      ],
      fr: [
        "Routage multi-agent fondé sur les capacités et workflows avec outils",
        "Circuit breakers, files de messages en échec, tampons hors ligne et reprise",
        "Routage de LLM locaux, exploitation de GGUF et chargement adapté aux ressources",
        "Mémoire graphe et vectorielle, bus d’événements et interaction en temps réel",
        "Conception de pilotes, contrôles, preuves et gouvernance pour l’adoption de l’IA",
      ],
    },
    projectIds: ["agent-resilience"],
    evidence: {
      en: [
        "Agent Resilience v0.1.0 with public source, tests, packaging, and CI",
        "Production Agent Template and related public backend packages",
        "AI Adoption Playbook with a public interactive guide",
        "Talos public architecture boundary and reproducible evaluation material",
      ],
      fr: [
        "Agent Resilience v0.1.0 avec code source, tests, packaging et CI publics",
        "Production Agent Template et packages backend publics associés",
        "AI Adoption Playbook avec guide interactif public",
        "Limite architecturale publique de Talos et matériel d’évaluation reproductible",
      ],
    },
  },
  security: {
    title: { en: "Security research", fr: "Recherche en sécurité" },
    lead: {
      en: "Web and application security, smart contracts, ZK and applied cryptography, and agentic AI attack paths.",
      fr: "Sécurité Web et applicative, smart contracts, ZK et cryptographie appliquée, ainsi que chaînes d’attaque sur les IA agentiques.",
    },
    capabilities: {
      en: [
        "Web applications, APIs, access control, business logic, and integrations",
        "Solidity and Vyper contracts with executable exploit proofs",
        "Circuits, verifiers, proof systems, and formal verification",
        "Indirect prompt injection, tool misuse, and adversarial evaluation",
        "Reports that separate public evidence from private program details",
      ],
      fr: [
        "Applications Web, API, contrôle d’accès, logique métier et intégrations",
        "Contrats Solidity et Vyper avec preuves d’exploitation exécutables",
        "Circuits, vérificateurs, systèmes de preuve et vérification formelle",
        "Injection indirecte de prompts, usage abusif d’outils et évaluation adversariale",
        "Rapports séparant les preuves publiques des détails privés des programmes",
      ],
    },
    projectIds: ["security-reviews"],
    evidence: {
      en: [
        "Public reproducible review repositories and CI",
        "Gray Swan Arena profile for indirect prompt injection research",
        "HackerOne association with the Treasury Board of Canada Secretariat",
        "Cantina associations with Reserve Protocol and Revert Finance",
        "Code4rena associations with Chainlink Payment Abstraction V2 and K2",
      ],
      fr: [
        "Dépôts publics de revues reproductibles et CI",
        "Profil Gray Swan Arena pour la recherche sur l’injection indirecte de prompts",
        "Association HackerOne avec le Secrétariat du Conseil du Trésor du Canada",
        "Associations Cantina avec Reserve Protocol et Revert Finance",
        "Associations Code4rena avec Chainlink Payment Abstraction V2 et K2",
      ],
    },
  },
};

export const ui = {
  en: {
    siteTitle: "Gilles Musy",
    roleLine: "Security Researcher · AI Engineer · Full-Stack Developer",
    skip: "Skip to content",
    menu: "Menu",
    closeMenu: "Close menu",
    navLabel: "Primary navigation",
    nav: {
      work: "Work",
      expertise: "Expertise",
      writing: "Writing",
      about: "About",
      contact: "Contact",
    },
    language: "Français",
    languageLabel: "View this page in French",
    viewCaseStudy: "View case study",
    viewEvidence: "View public evidence",
    status: "Status",
    role: "Role",
    stack: "Stack",
    updated: "Evidence date",
    selected: "Selected",
    filters: "Filter work",
    noProjects: "No project matches this filter.",
    backToWork: "Back to all work",
    externalLinks: "Public links",
    nextProject: "Next case study",
    notFoundTitle: "Page not found",
    notFoundText: "The requested page is not part of the public portfolio.",
    homeAction: "Return home",
  },
  fr: {
    siteTitle: "Gilles Musy",
    roleLine: "Chercheur en sécurité · Ingénieur IA · Développeur full-stack",
    skip: "Aller au contenu",
    menu: "Menu",
    closeMenu: "Fermer le menu",
    navLabel: "Navigation principale",
    nav: {
      work: "Réalisations",
      expertise: "Expertise",
      writing: "Publications",
      about: "À propos",
      contact: "Contact",
    },
    language: "English",
    languageLabel: "View this page in English",
    viewCaseStudy: "Voir l’étude de cas",
    viewEvidence: "Voir les preuves publiques",
    status: "État",
    role: "Rôle",
    stack: "Technologies",
    updated: "Date des preuves",
    selected: "Sélectionné",
    filters: "Filtrer les réalisations",
    noProjects: "Aucun projet ne correspond à ce filtre.",
    backToWork: "Retour aux réalisations",
    externalLinks: "Liens publics",
    nextProject: "Étude de cas suivante",
    notFoundTitle: "Page introuvable",
    notFoundText: "La page demandée ne fait pas partie du portfolio public.",
    homeAction: "Retour à l’accueil",
  },
} as const;

export function localized(value: Bilingual, locale: Locale): string {
  return value[locale];
}

export function projectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}
