import { type Locale } from "./content/site";

const copy = {
  fr: {
    title: "La boutique et son assistant",
    introduction:
      "Mika, le vrai chat qui incarne la marque, est au cœur de la boutique. Un assistant conversationnel accompagne le conseil produit, tandis que le SAV suit un parcours distinct.",
    storefront: "La boutique, sur ordinateur et mobile",
    storeAlt:
      "Accueil de Mika’s Shop : navigation, photo de Mika et sélection de produits selon le profil du chat",
    chat: "L’assistant de la boutique",
    chatAlt:
      "Interface mobile de l’assistant de Mika’s Shop ouverte sur son message d’accueil, sans conversation et avec un champ de saisie vide",
    capture:
      "Captures réelles de la version française, le 12 septembre 2026. Le chat a été ouvert sans envoyer de message ; son interface est visible, mais les réponses du service n’ont pas été testées.",
    open: "Agrandir la capture",
    system: "Trois rôles, des responsabilités distinctes",
    systemLead:
      "Schéma de l’implémentation décrite dans cette étude de cas, pas un indicateur d’activité des services.",
    nodes: [
      {
        title: "Boutique Shopify",
        body: "Catalogue, panier et paiement. La vitrine présente les produits et leurs caractéristiques.",
        relation: "Le catalogue alimente le conseil produit.",
      },
      {
        title: "Assistant conversationnel IA",
        body: "Widget et backend de conseil : recherche, informations produit et orientation dans le site.",
        relation: "Le chat consulte les contenus de la boutique.",
      },
      {
        title: "SAV Talos",
        body: "Parcours d’assistance séparé : demandes, réponses, validations et transmission à un opérateur.",
        relation: "Le SAV traite les demandes d’assistance.",
      },
    ],
  },
  en: {
    title: "The storefront and its assistant",
    introduction:
      "Mika, the real cat behind the brand, is at the heart of the storefront. An AI assistant provides product guidance, while customer support follows a separate workflow.",
    storefront: "The storefront, on desktop and mobile",
    storeAlt:
      "Mika’s Shop homepage: navigation, Mika’s photo and product selection by cat profile",
    chat: "The store’s assistant",
    chatAlt:
      "Mika’s Shop mobile assistant interface showing its welcome message, no conversation and an empty input field",
    capture:
      "Actual screenshots of the French storefront, captured on 12 September 2026. The chat was opened without sending a message; its interface is visible, but service responses were not tested.",
    open: "View full-size screenshot",
    system: "Three roles, distinct responsibilities",
    systemLead:
      "A diagram of the implementation described in this case study, not a live service-status display.",
    nodes: [
      {
        title: "Shopify storefront",
        body: "Catalogue, cart and checkout. The storefront presents products and their attributes.",
        relation: "The catalogue informs product guidance.",
      },
      {
        title: "AI shopping assistant",
        body: "Guidance widget and backend: search, product information and site navigation.",
        relation: "The chat consults store content.",
      },
      {
        title: "Talos customer support",
        body: "A separate support workflow: requests, replies, approvals and operator escalation.",
        relation: "Customer support handles assistance requests.",
      },
    ],
  },
};

export function MikaOverview({ locale }: { locale: Locale }) {
  const text = copy[locale];
  return (
    <section
      className="section-shell mika-overview"
      aria-labelledby="mika-overview-title"
    >
      <h2 id="mika-overview-title">{text.title}</h2>
      <p className="mika-overview-lead">{text.introduction}</p>
      <div className="mika-gallery">
        <figure className="mika-capture mika-capture-store">
          <picture>
            <source
              media="(max-width: 520px)"
              srcSet="/mikasshop-mobile.jpg"
              width="375"
              height="812"
            />
            <img
              src="/mikasshop-desktop.jpg"
              alt={text.storeAlt}
              width="1425"
              height="891"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <figcaption>{text.storefront}</figcaption>
          <a
            className="text-link mika-full-desktop"
            href="/mikasshop-desktop.jpg"
          >
            {text.open}
          </a>
          <a
            className="text-link mika-full-mobile"
            href="/mikasshop-mobile.jpg"
          >
            {text.open}
          </a>
        </figure>
        <figure className="mika-capture mika-capture-chat">
          <img
            src="/mikasshop-chat.jpg"
            alt={text.chatAlt}
            width="375"
            height="812"
            loading="lazy"
            decoding="async"
          />
          <figcaption>{text.chat}</figcaption>
          <a className="text-link" href="/mikasshop-chat.jpg">
            {text.open}
          </a>
        </figure>
      </div>
      <p className="mika-capture-note">{text.capture}</p>
      <div className="mika-system" aria-labelledby="mika-system-title">
        <h3 id="mika-system-title">{text.system}</h3>
        <p>{text.systemLead}</p>
        <ul className="mika-system-nodes">
          {text.nodes.map((node, index) => (
            <li key={node.title}>
              <span className="mika-node-number" aria-hidden="true">
                0{index + 1}
              </span>
              <h4>{node.title}</h4>
              <p>{node.body}</p>
              <p className="mika-node-relation">{node.relation}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
