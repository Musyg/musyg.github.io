import { type Locale } from "./content/site";

const copy = {
  fr: {
    title: "La boutique et ses agents",
    introduction:
      "Mika, le vrai chat qui incarne la marque, est au cœur de la boutique. J’ai développé le conseil produit, le SAV, les parcours de contenu et le suivi e-commerce qui accompagnent son activité.",
    storefront: "La boutique, sur ordinateur et mobile",
    storeAlt:
      "Accueil de Mika’s Shop : navigation, photo de Mika et sélection de produits selon le profil du chat",
    chat: "L’assistant de la boutique",
    chatAlt:
      "Interface mobile de l’assistant de Mika’s Shop ouverte sur son message d’accueil, sans conversation et avec un champ de saisie vide",
    capture:
      "Boutique et interface de l’assistant. Captures du 12 septembre 2026.",
    open: "Agrandir la capture",
    system: "Du conseil produit à l’analyse de la boutique",
    systemLead: "Les parcours développés pour Mika’s Shop.",
    nodes: [
      {
        title: "Boutique et agent e-commerce",
        body: "Catalogue, stock et informations produit via les API Shopify. Le panier et le paiement restent dans la boutique.",
        relation:
          "La recherche catalogue fournit le contexte au conseil produit.",
      },
      {
        title: "Assistant conversationnel IA",
        body: "Widget et backend de conseil : recherche, informations produit et orientation dans le site.",
        relation:
          "Les outils consultent produits, disponibilités, politiques et liens du site.",
      },
      {
        title: "SAV et contenus",
        body: "Assistance, brouillons de réponse et transmission à un opérateur. Un parcours éditorial prépare aussi des contenus produit en français et en anglais.",
        relation:
          "Les documents de la boutique apportent le contexte ; les brouillons passent par une validation.",
      },
      {
        title: "Pixel et Analytics Hub",
        body: "Pixel de suivi maison, événements de la boutique et KPI pour l’analyse du parcours d’achat.",
        relation:
          "Événements de navigation et des agents → agrégation → Analytics Hub.",
      },
    ],
  },
  en: {
    title: "The storefront and its agents",
    introduction:
      "Mika, the real cat behind the brand, is at the heart of the storefront. I developed the product-guidance, support, content and ecommerce-tracking workflows behind the store.",
    storefront: "The storefront, on desktop and mobile",
    storeAlt:
      "Mika’s Shop homepage: navigation, Mika’s photo and product selection by cat profile",
    chat: "The store’s assistant",
    chatAlt:
      "Mika’s Shop mobile assistant interface showing its welcome message, no conversation and an empty input field",
    capture:
      "Storefront and assistant interface. Screenshots taken on 12 September 2026.",
    open: "View full-size screenshot",
    system: "From product guidance to store analytics",
    systemLead: "The workflows developed for Mika’s Shop.",
    nodes: [
      {
        title: "Storefront and ecommerce agent",
        body: "Catalogue, stock and product information through Shopify APIs. Cart and checkout remain in the storefront.",
        relation: "Catalogue retrieval provides context for product guidance.",
      },
      {
        title: "AI store assistant",
        body: "Guidance widget and backend: search, product information and site navigation.",
        relation: "Tools read products, availability, policies and site links.",
      },
      {
        title: "Support and content",
        body: "Support requests, draft replies and operator escalation. An editorial workflow also prepares French and English product-based content.",
        relation: "Store documents provide context; drafts go through review.",
      },
      {
        title: "Tracking pixel and Analytics Hub",
        body: "Custom tracking pixel, storefront events and KPIs for purchase-path analysis.",
        relation: "Storefront and agent events → aggregation → Analytics Hub.",
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
