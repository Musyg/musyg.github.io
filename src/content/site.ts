export type Locale = "en" | "fr";

export type Practice = "software" | "ai" | "security";

export type ProjectStatus =
  | "public-mvp"
  | "stable-release"
  | "public-testnet"
  | "published-research"
  | "active-rebuild"
  | "store-and-integrations";

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
  urlFr?: string;
}

export function publicLinkUrl(link: PublicLink, locale: Locale): string {
  return locale === "fr" ? (link.urlFr ?? link.url) : link.url;
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
  evidenceCheckedAt: string;
  projectStart?: Bilingual;
  stack: string[];
  cardStack?: string[];
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
  evidence: { en: "Resources and links", fr: "Ressources et liens" },
  limitations: {
    en: "Scope and current status",
    fr: "Périmètre et état actuel",
  },
};

export const statusLabels: Record<ProjectStatus, Bilingual> = {
  "public-mvp": {
    en: "Public MVP, in development",
    fr: "MVP public, en développement",
  },
  "stable-release": { en: "Stable release", fr: "Version stable" },
  "store-and-integrations": {
    en: "Online store",
    fr: "Boutique en ligne",
  },
  "public-testnet": {
    en: "Testnet deployment",
    fr: "Déploiement testnet",
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
    id: "bifrost-vpn",
    slug: { en: "bifrost-vpn", fr: "bifrost-vpn" },
    title: "Bifrost",
    summary: {
      en: "Self-hosted VPN in Rust for Windows and Linux, with WireGuard, a kill switch, and leak-prevention checks.",
      fr: "VPN auto-hébergé en Rust pour Windows et Linux, avec WireGuard, kill switch et contrôles anti-fuite.",
    },
    role: {
      en: "Systems and network engineering, security-product development",
      fr: "Ingénierie système et réseau, développement d’un produit de cybersécurité",
    },
    status: "public-mvp",
    practice: "software",
    filters: ["software"],
    evidenceCheckedAt: "2026-09-16",
    stack: [
      "Rust",
      "WireGuard",
      "Windows Filtering Platform",
      "nftables",
      "Tokio",
      "Linux",
      "Windows",
    ],
    cardStack: ["Rust", "WireGuard", "WFP", "nftables"],
    sections: {
      summary: {
        en: [
          "Bifrost is a self-hosted VPN for Windows 11 and Linux. Its public MVP provides a background service and command-line client, focused on the tunnel lifecycle and preventing traffic from escaping outside it.",
        ],
        fr: [
          "Bifrost est un VPN auto-hébergé pour Windows 11 et Linux. Son MVP public comprend un service système et un client en ligne de commande, centrés sur le cycle de vie du tunnel et la prévention des sorties de trafic hors de celui-ci.",
        ],
      },
      role: {
        en: [
          "I develop Bifrost as a systems and network engineering project: tunnel orchestration, firewall policies, DNS handling, service integration, and test tooling. This is security-product development, distinct from my vulnerability research and red teaming work.",
        ],
        fr: [
          "Je développe Bifrost comme un projet d’ingénierie système et réseau : orchestration du tunnel, politiques de pare-feu, gestion DNS, intégration aux services système et outils de test. Il s’agit de développer un produit de cybersécurité, une activité distincte de mes recherches de vulnérabilités et de mon red teaming.",
        ],
      },
      problem: {
        en: [
          "A tunnel can stop, reconnect, or encounter a DNS failure. The system must coordinate these transitions with traffic filtering, rather than treating a successful connection as sufficient protection.",
        ],
        fr: [
          "Un tunnel peut s’interrompre, se reconnecter ou rencontrer une panne DNS. Le système doit coordonner ces transitions avec le filtrage du trafic, plutôt que de considérer une connexion réussie comme une protection suffisante.",
        ],
      },
      architecture: {
        en: [
          "The Rust workspace separates the state machine, privileged daemon, CLI, authenticated IPC, firewall, DNS, and secret storage. WireGuard integrates with the Linux kernel and WireGuardNT on Windows; filtering uses nftables and Windows Filtering Platform respectively.",
        ],
        fr: [
          "L’espace de travail Rust sépare la machine à états, le daemon privilégié, la CLI, les communications IPC authentifiées, le pare-feu, le DNS et le stockage des secrets. WireGuard s’intègre au noyau Linux et à WireGuardNT sous Windows ; le filtrage repose respectivement sur nftables et Windows Filtering Platform.",
        ],
      },
      decisions: {
        en: [
          "The state machine produces actions without making system calls. Firewall policies are represented as data, allowing their behavior to be tested separately from privileged execution. The kill switch is designed to remain armed across connection failures and reconnects.",
        ],
        fr: [
          "La machine à états produit des actions sans effectuer d’appels système. Les politiques de pare-feu sont représentées sous forme de données, ce qui permet de les tester séparément de leur exécution privilégiée. Le kill switch est conçu pour rester armé lors des échecs de connexion et des reconnexions.",
        ],
      },
      security: { en: [], fr: [] },
      testing: {
        en: [
          "The public repository includes leak-test benches and automated Linux and Windows checks. The CI run linked below passed its Linux and Windows jobs, leak suite, dependency audit, and software-component inventory generation. Tests that cannot run in a given environment are tracked separately.",
        ],
        fr: [
          "Le dépôt public comprend des bancs anti-fuite et des contrôles automatisés Linux et Windows. L’exécution CI liée ci-dessous a réussi ses contrôles Linux et Windows, sa suite anti-fuite, son audit des dépendances et la génération de l’inventaire des composants logiciels. Les tests qui ne peuvent pas tourner dans un environnement donné sont suivis séparément.",
        ],
      },
      results: { en: [], fr: [] },
      evidence: { en: [], fr: [] },
      limitations: {
        en: [
          "The project remains in development. The public version provides a daemon and CLI; the graphical interface is not yet published, and no GitHub release is available. Anti-censorship transports and OS telemetry reduction are ongoing work: DNS filtering is implemented, while some Windows layers remain unfinished. This MVP does not guarantee leak-free operation or anonymity in every environment.",
        ],
        fr: [
          "Le projet reste en développement. La version publique fournit un daemon et une CLI ; l’interface graphique n’est pas encore publiée et aucune release GitHub n’est disponible. Les transports anti-censure et la réduction de la télémétrie de l’OS sont en cours : le filtrage DNS est implémenté, tandis que certaines couches Windows restent à terminer. Ce MVP ne constitue pas une garantie universelle d’absence de fuite ou d’anonymat.",
        ],
      },
    },
    links: [
      {
        label: { en: "Public repository", fr: "Dépôt public" },
        url: "https://github.com/Musyg/bifrost-vpn",
      },
      {
        label: {
          en: "Documented project status",
          fr: "État documenté du projet",
        },
        url: "https://github.com/Musyg/bifrost-vpn/blob/2f3a995842a44dd8b4476b11e42354acff4399d2/ETAT.md",
      },
      {
        label: { en: "Linux and Windows CI", fr: "CI Linux et Windows" },
        url: "https://github.com/Musyg/bifrost-vpn/actions/runs/34884823744",
      },
    ],
  },
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
    evidenceCheckedAt: "2026-08-16",
    projectStart: { en: "June 2026", fr: "Juin 2026" },
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
          "I designed and implemented the smart contract, deployment workflow, relayer backend, frontend integration, and tests.",
        ],
        fr: [
          "J’ai conçu et réalisé le smart contract, le parcours de déploiement, le backend de relais, l’intégration frontend et les tests.",
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
        en: [],
        fr: [],
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
        en: [],
        fr: [],
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
    evidenceCheckedAt: "2026-08-24",
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
          "I reproduce the vulnerable behavior, document impact and assumptions, implement or explain remediation, and keep the evidence runnable in CI.",
        ],
        fr: [
          "Je reproduis le comportement vulnérable, documente l’impact et les hypothèses, mets en œuvre ou explique la correction et maintiens les preuves exécutables en CI.",
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
        en: [],
        fr: [],
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
        en: [],
        fr: [],
      },
      limitations: {
        en: ["Confidential submissions are not included in this catalogue."],
        fr: [
          "Les signalements confidentiels ne figurent pas dans ce catalogue.",
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
    evidenceCheckedAt: "2026-08-13",
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
          "I designed the package interfaces, implemented the failure modes, wrote the tests and usage examples, configured packaging and CI, and published v0.1.0.",
        ],
        fr: [
          "J’ai conçu les interfaces du package, réalisé les modes de panne, écrit les tests et exemples d’utilisation, configuré le packaging et la CI, puis publié la version v0.1.0.",
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
        en: [],
        fr: [],
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
        en: [],
        fr: [],
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
      en: "WordPress/WooCommerce website with React interfaces, a custom PHP backend and supplier integration. Rebuild in progress.",
      fr: "Site WordPress/WooCommerce avec interfaces React, backend PHP sur mesure et intégration fournisseur. Refonte en cours.",
    },
    role: {
      en: "Website and backend development",
      fr: "Développement du site et du backend",
    },
    status: "active-rebuild",
    practice: "software",
    filters: ["software", "web"],
    evidenceCheckedAt: "2026-09-12",
    projectStart: { en: "2023", fr: "2023" },
    cardStack: [
      "WordPress",
      "WooCommerce",
      "React 19",
      "TypeScript",
      "Vite",
      "PHP",
      "REST",
    ],
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
          "I develop the website and backend: WordPress content models, custom PHP plugins and REST endpoints, React interfaces, contact flows and deployment tooling. I also built a DigiKey integration to search and import product references into WooCommerce, enrich product information and update prices and availability.",
        ],
        fr: [
          "Je développe le site et son backend : modèles de contenu WordPress, extensions PHP et points d’accès REST dédiés, interfaces React, parcours de contact et outils de déploiement. J’ai également créé une intégration DigiKey pour rechercher et importer des références dans WooCommerce, enrichir les fiches produits et mettre à jour les prix et disponibilités.",
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
          "A separate supplier integration connects the DigiKey API to WooCommerce products. It maps descriptions, images and technical attributes, with manual updates and a scheduled price and stock synchronisation mechanism. A custom contact endpoint connects the website form to WordPress mail handling.",
        ],
        fr: [
          "Une extension PHP dédiée définit les modèles de contenu, les taxonomies, les données structurées, les points d’accès REST et les points de montage conditionnels de React. Vite construit des interfaces React 19 et TypeScript propres à chaque page, tandis que WooCommerce conserve le catalogue et les parcours d’achat.",
          "Une intégration fournisseur distincte relie l’API DigiKey aux produits WooCommerce. Elle associe descriptions, images et caractéristiques techniques, avec des mises à jour manuelles et un mécanisme de synchronisation programmé des prix et stocks. Un point d’accès dédié relie le formulaire de contact à l’envoi de courriels WordPress.",
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
        en: [],
        fr: [],
      },
      testing: {
        en: [
          "End-to-end validation of product imports, attribute mapping, and price and stock updates is pending during the rebuild.",
        ],
        fr: [
          "La validation de bout en bout de l’import de produits, de la correspondance des attributs et des mises à jour des prix et stocks reste à finaliser dans le cadre de la refonte.",
        ],
      },
      results: {
        en: [],
        fr: [],
      },
      evidence: {
        en: [
          "Explore the project and its architecture in the linked case study. Integration source code is private.",
        ],
        fr: [
          "Le projet et son architecture sont présentés dans l’étude de cas ci-dessous. Le code des intégrations est privé.",
        ],
      },
      limitations: {
        en: [
          "The rebuild is in progress. Current production activation of the supplier integration and contact backend has not been verified.",
        ],
        fr: [
          "La refonte est en cours. L’activation actuelle en production de l’intégration fournisseur et du backend de contact n’a pas été vérifiée.",
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
        urlFr:
          "https://github.com/Musyg/Musyg/blob/main/case-studies/fr/inaricom.md",
      },
    ],
  },
  {
    id: "mikasshop",
    slug: { en: "mikasshop", fr: "mikasshop" },
    title: "Mika's Shop",
    summary: {
      en: "Shopify storefront, AI shopping assistant and customer-support integrations for a pet-products store.",
      fr: "Boutique Shopify, assistant conversationnel IA et intégrations SAV pour une enseigne dédiée aux animaux de compagnie.",
    },
    role: {
      en: "Storefront design, AI chat development and customer-support integrations",
      fr: "Conception de la boutique, développement du chat IA et intégrations SAV",
    },
    status: "store-and-integrations",
    practice: "software",
    filters: ["software", "web", "ai"],
    evidenceCheckedAt: "2026-09-12",
    projectStart: { en: "2024", fr: "2024" },
    cardStack: ["Shopify", "Python", "FastAPI", "Shopify APIs", "SSE", "MQTT"],
    stack: [
      "Shopify",
      "Liquid theme configuration",
      "Shopify Markets",
      "Multilingual content",
      "Python",
      "FastAPI",
      "Shopify APIs",
      "SSE",
      "MQTT",
    ],
    sections: {
      summary: {
        en: [
          "Mika is the real cat at the heart of the Mika's Shop brand. The Shopify pet-products store also includes a custom AI shopping assistant and customer-support services developed in Talos. Visitors can browse by cat profile or product category; the assistant is designed to guide them using the catalogue and site content.",
        ],
        fr: [
          "Mika est le vrai chat qui incarne la marque Mika's Shop. La boutique Shopify pour animaux de compagnie intègre également un assistant conversationnel IA sur mesure et des services SAV développés dans Talos. La navigation propose des entrées par profil de chat ou catégorie de produits ; l’assistant est conçu pour guider les visiteurs à partir du catalogue et des contenus du site.",
        ],
      },
      role: {
        en: [
          "I designed and built the storefront, from the theme, navigation and collections to localization, editorial content and launch. I also developed the store’s AI assistant interface and backend, its catalogue and site-content tools, and the store's integration with the Talos customer-support agent.",
        ],
        fr: [
          "J’ai conçu et réalisé la boutique, du thème, de la navigation et des collections à la localisation, aux contenus éditoriaux et à la mise en ligne. J’ai aussi développé l’interface et le backend de l’assistant conversationnel, ses outils d’accès au catalogue et aux contenus du site, ainsi que l’intégration de la boutique à l’agent SAV Talos.",
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
          "The store’s AI assistant uses a Python/FastAPI service with tool calls for product advice, catalogue search, stock, store policies and navigation links. A browser widget displays responses over SSE. A separate Talos SAV service handles support requests, response drafts, operator approval and escalation pathways, with MQTT connecting the approval workflow.",
        ],
        fr: [
          "Shopify fournit le commerce hébergé, le catalogue, la localisation, le panier et le passage en caisse. Le thème de la vitrine organise les collections par type de produit et profil de chat, les contenus multilingues, les pages éditoriales et les informations clients.",
          "L’assistant de la boutique s’appuie sur un service Python/FastAPI et des appels d’outils pour le conseil produit, la recherche dans le catalogue, les stocks, les politiques de la boutique et les liens de navigation. Un widget affiche les réponses via SSE. Un service SAV Talos distinct gère les demandes d’assistance, les brouillons, les validations et les transmissions à un opérateur, avec MQTT pour relier le parcours de validation.",
        ],
      },
      decisions: {
        en: [
          "Shopify retains checkout and commerce while custom services handle guidance and support. The assistant’s tool set focuses on site information rather than order lookup or purchases. The SAV follows a separate workflow with configurable response routing and operator escalation; it is not the public shopping chat.",
        ],
        fr: [
          "Shopify conserve le paiement et le commerce, tandis que les services sur mesure prennent en charge le conseil et l’assistance. Les outils de l’assistant portent sur les informations du site, pas sur le suivi de commandes ni les achats. Le SAV suit un parcours distinct, avec un mode de réponse configurable et une transmission à un opérateur ; il ne se confond pas avec l’assistant public.",
        ],
      },
      security: {
        en: [],
        fr: [],
      },
      testing: {
        en: [],
        fr: [],
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
          "Explore the storefront and its case study. The assistant and support integrations use private source code.",
        ],
        fr: [
          "Découvrez la boutique et son étude de cas. Le code de l’assistant et des intégrations SAV est privé.",
        ],
      },
      limitations: {
        en: [
          "The store is online. The assistant and support integrations have been developed; their current production operation has not been verified for this case study.",
        ],
        fr: [
          "La boutique est en ligne. L’assistant et les intégrations SAV sont développés ; leur fonctionnement actuel en production n’a pas été vérifié pour cette étude de cas.",
        ],
      },
    },
    links: [
      {
        label: { en: "Live store", fr: "Boutique publique" },
        url: "https://mikasshop.com",
      },
      {
        label: { en: "Storefront case study", fr: "Étude de la vitrine" },
        url: "https://github.com/Musyg/Musyg/blob/main/case-studies/en/mikasshop.md",
        urlFr:
          "https://github.com/Musyg/Musyg/blob/main/case-studies/fr/mikasshop.md",
      },
    ],
  },
  {
    id: "pedi-sense",
    slug: { en: "pedi-sense", fr: "pedi-sense" },
    title: "Pedi-Sense",
    summary: {
      en: "Shopify storefront, customer-support agent and custom ecommerce integrations.",
      fr: "Boutique Shopify, agent SAV et intégrations e-commerce sur mesure.",
    },
    role: {
      en: "Storefront design, agent development and backend integrations",
      fr: "Conception de la boutique, développement d’agents et intégrations backend",
    },
    status: "store-and-integrations",
    practice: "software",
    filters: ["software", "web", "ai"],
    evidenceCheckedAt: "2026-09-12",
    projectStart: { en: "Late 2022", fr: "Fin 2022" },
    cardStack: ["Shopify", "Python", "Shopify APIs", "MQTT", "Listmonk"],
    stack: [
      "Shopify",
      "Liquid theme configuration",
      "Shopify Markets",
      "Localized metadata",
      "Python",
      "Shopify APIs",
      "MQTT",
      "Listmonk",
    ],
    sections: {
      summary: {
        en: [
          "Pedi-Sense combines a Shopify storefront with custom services developed within Talos: customer support, email workflows and ecommerce event analysis. The work covers both the customer-facing store and the integrations behind it.",
        ],
        fr: [
          "Pedi-Sense associe une boutique Shopify à des services sur mesure développés dans Talos : SAV, parcours email et analyse des événements e-commerce. Le travail couvre à la fois la boutique visible par les clients et les intégrations qui l’accompagnent.",
        ],
      },
      role: {
        en: [
          "I designed and implemented the storefront, from theme composition and product options to localization, content and launch. I also developed the Pedi-Sense integrations within Talos, including customer-support workflows, branded emails and storefront event collection.",
        ],
        fr: [
          "J’ai conçu et réalisé la boutique, de la composition du thème et des options produit à la localisation, aux contenus et à la mise en ligne. J’ai aussi développé les intégrations Pedi-Sense dans Talos, notamment les parcours SAV, les emails aux couleurs de la marque et la collecte des événements de la boutique.",
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
          "Shopify handles the catalogue, accounts, cart and checkout. Separate Talos services provide a multi-store support agent, connections to order and product information, email delivery through Listmonk, and event collection and attribution. Python services, Shopify APIs and MQTT connect these components.",
        ],
        fr: [
          "Shopify prend en charge le catalogue, les comptes, le panier et le paiement. Des services Talos distincts apportent un agent SAV multi-boutiques, l’accès aux informations de commande et de produit, l’envoi d’emails via Listmonk ainsi que la collecte et l’attribution des événements. Des services Python, les API Shopify et MQTT relient ces composants.",
        ],
      },
      decisions: {
        en: [
          "I kept checkout within Shopify while developing business workflows separately. Support includes draft responses for review and escalation to an operator. Email templates cover order confirmations, abandoned carts and shipping notifications.",
        ],
        fr: [
          "J’ai conservé le paiement dans Shopify tout en développant les parcours métier séparément. Le SAV comprend des brouillons à valider et une transmission à un opérateur. Les modèles d’emails couvrent les confirmations de commande, les paniers abandonnés et les expéditions.",
        ],
      },
      security: {
        en: [],
        fr: [],
      },
      testing: {
        en: [],
        fr: [],
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
          "Explore the storefront and its case study. The Talos integrations use private source code.",
        ],
        fr: [
          "Découvrez la boutique et son étude de cas. Le code des intégrations Talos est privé.",
        ],
      },
      limitations: {
        en: [
          "The store is online. Backend integrations have been developed; their current production activation has not been verified for this case study. This project covers software development, not an assessment of the product’s health benefits.",
        ],
        fr: [
          "La boutique est en ligne. Les intégrations backend sont développées ; leur activation actuelle en production n’a pas été vérifiée pour cette étude de cas. Le projet porte sur le développement logiciel, pas sur l’évaluation des effets du produit sur la santé.",
        ],
      },
    },
    links: [
      {
        label: { en: "Live store", fr: "Boutique publique" },
        url: "https://pedi-sense.com",
      },
      {
        label: { en: "Storefront case study", fr: "Étude de la vitrine" },
        url: "https://github.com/Musyg/Musyg/blob/main/case-studies/en/pedi-sense.md",
        urlFr:
          "https://github.com/Musyg/Musyg/blob/main/case-studies/fr/pedi-sense.md",
      },
    ],
  },
];

export type PlatformId =
  "github" | "gray-swan" | "hackerone" | "cantina" | "code4rena";

export const professionalProfiles: Array<{
  platform: PlatformId;
  name: string;
  handle: string;
  association: Bilingual;
  url: string;
}> = [
  {
    name: "GitHub",
    platform: "github",
    handle: "Musyg",
    association: {
      en: "Public repositories and releases",
      fr: "Dépôts publics et releases",
    },
    url: "https://github.com/Musyg",
  },
  {
    name: "Gray Swan Arena",
    platform: "gray-swan",
    handle: "GilMu",
    association: {
      en: "Indirect prompt injection research and adversarial AI evaluation",
      fr: "Recherche sur l’injection indirecte de prompts et évaluation adversariale de l’IA",
    },
    url: "https://app.grayswan.ai/arena/user/6a3043c8221a153764c96ab5",
  },
  {
    name: "HackerOne",
    platform: "hackerone",
    handle: "@gilmu",
    association: {
      en: "Treasury Board of Canada Secretariat",
      fr: "Secrétariat du Conseil du Trésor du Canada",
    },
    url: "https://hackerone.com/gilmu",
  },
  {
    name: "Cantina",
    platform: "cantina",
    handle: "@GilMu",
    association: {
      en: "Reserve Protocol and Revert Finance",
      fr: "Reserve Protocol et Revert Finance",
    },
    url: "https://cantina.xyz/u/GilMu",
  },
  {
    name: "Code4rena",
    platform: "code4rena",
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
    evidence: { en: string[]; fr: string[] } | PublicLink[];
  }
> = {
  software: {
    title: { en: "Software engineering", fr: "Ingénierie logicielle" },
    lead: {
      en: "Backend services, infrastructure, web applications, blockchain, and open-source tools.",
      fr: "Services backend, infrastructure, applications web, blockchain et outils open source.",
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
    projectIds: [
      "bifrost-vpn",
      "celo-credentials",
      "inaricom",
      "mikasshop",
      "pedi-sense",
    ],
    evidence: {
      en: [
        "Source-verified Celo Sepolia deployment and reproducible lifecycle",
        "Public Shopify storefronts with bilingual case studies",
        "Published Python packages, releases, tests, and CI",
        "Documented Inaricom architecture, with the site currently being rebuilt",
      ],
      fr: [
        "Déploiement Celo Sepolia au code source vérifié et cycle reproductible",
        "Boutiques Shopify publiques avec études de cas bilingues",
        "Packages Python, releases, tests et CI publics",
        "Architecture Inaricom documentée, avec un site en cours de refonte",
      ],
    },
  },
  ai: {
    title: { en: "Agentic AI engineering", fr: "Ingénierie IA agentique" },
    lead: {
      en: "AI shopping assistants, customer-support agents and the infrastructure behind them: orchestration, memory, resilience and observability.",
      fr: "Assistants conversationnels de conseil produit, agents SAV et infrastructure associée : orchestration, mémoire, résilience et observabilité.",
    },
    capabilities: {
      en: [
        "Python services connected to ecommerce APIs for product advice and customer support, with operator review and escalation in the support workflows",
        "Capability-based multi-agent routing and tool-enabled workflows",
        "Circuit breakers, dead-letter queues, offline buffers, and recovery",
        "Local LLM routing, GGUF operations, and resource-aware model loading",
        "Graph and vector memory, event buses, and real-time interaction",
        "Pilot design, controls, evidence, and governance for AI adoption",
      ],
      fr: [
        "Services Python reliés aux API e-commerce pour le conseil produit et le SAV, avec validation et transmission à un opérateur dans les parcours SAV",
        "Routage multi-agent fondé sur les capacités et workflows avec outils",
        "Circuit breakers, files de messages en échec, tampons hors ligne et reprise",
        "Routage de LLM locaux, exploitation de GGUF et chargement adapté aux ressources",
        "Mémoire graphe et vectorielle, bus d’événements et interaction en temps réel",
        "Conception de pilotes, contrôles, preuves et gouvernance pour l’adoption de l’IA",
      ],
    },
    projectIds: ["agent-resilience", "mikasshop", "pedi-sense"],
    evidence: [
      {
        label: {
          en: "Agent Resilience: public source, tests, packaging, and CI",
          fr: "Agent Resilience : code source, tests, packaging et CI publics",
        },
        url: "https://github.com/Musyg/agent-resilience",
      },
      {
        label: {
          en: "Production Agent Template: public repository",
          fr: "Production Agent Template : dépôt public",
        },
        url: "https://github.com/Musyg/production-agent-template",
      },
      {
        label: {
          en: "AI Adoption Playbook: public repository",
          fr: "AI Adoption Playbook : dépôt public",
        },
        url: "https://github.com/Musyg/ai-adoption-playbook",
      },
      {
        label: {
          en: "AI Adoption Playbook: interactive guide",
          fr: "AI Adoption Playbook : guide interactif",
        },
        url: "https://musyg.github.io/ai-adoption-playbook/",
        urlFr: "https://musyg.github.io/ai-adoption-playbook/fr/",
      },
      {
        label: {
          en: "Talos, since December 2024: public architecture and evaluation material; implementation remains private",
          fr: "Talos, depuis décembre 2024 : architecture et éléments d’évaluation publics ; l’implémentation reste privée",
        },
        url: "https://github.com/Musyg/talos",
      },
    ],
  },
  security: {
    title: {
      en: "Cybersecurity and red teaming",
      fr: "Cybersécurité et red teaming",
    },
    lead: {
      en: "I research vulnerabilities and test how systems withstand adversarial scenarios: websites, applications and APIs, crypto protocols and smart contracts, and agentic AI systems.",
      fr: "Je recherche des vulnérabilités et j’évalue la résistance des systèmes à des scénarios adversariaux : sites Web, applications et API, protocoles crypto et smart contracts, systèmes d’IA agentiques.",
    },
    capabilities: {
      en: [
        "Vulnerability research and red teaming within authorized scopes",
        "Websites, applications, APIs, access control, business logic, and integrations",
        "Solidity and Vyper contracts with executable exploit proofs",
        "Circuits, verifiers, proof systems, and formal verification",
        "AI red teaming: indirect prompt injection, tool misuse, and adversarial evaluation",
        "Reports that separate public evidence from private program details",
      ],
      fr: [
        "Recherche de vulnérabilités et red teaming dans des périmètres autorisés",
        "Sites Web, applications, API, contrôle d’accès, logique métier et intégrations",
        "Contrats Solidity et Vyper avec preuves d’exploitation exécutables",
        "Circuits, vérificateurs, systèmes de preuve et vérification formelle",
        "Red teaming IA : injection indirecte de prompts, usage abusif d’outils et évaluation adversariale",
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
    viewEvidence: "Explore the resource",
    status: "Status",
    role: "Role",
    stack: "Stack",
    projectStart: "Project started",
    selected: "Selected",
    filters: "Filter work",
    noProjects: "No project matches this filter.",
    backToWork: "Back to all work",
    externalLinks: "Public links",
    nextProject: "Next case study",
    notFoundTitle: "Page not found",
    notFoundText: "This page could not be found.",
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
    viewEvidence: "Consulter la ressource",
    status: "État",
    role: "Rôle",
    stack: "Technologies",
    projectStart: "Début du projet",
    selected: "Sélectionné",
    filters: "Filtrer les réalisations",
    noProjects: "Aucun projet ne correspond à ce filtre.",
    backToWork: "Retour aux réalisations",
    externalLinks: "Liens publics",
    nextProject: "Étude de cas suivante",
    notFoundTitle: "Page introuvable",
    notFoundText: "Cette page est introuvable.",
    homeAction: "Retour à l’accueil",
  },
} as const;

export function localized(value: Bilingual, locale: Locale): string {
  return value[locale];
}

export function projectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}
