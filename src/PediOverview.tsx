import { type Locale } from "./content/site";

const copy = {
  fr: {
    title: "De la boutique aux services e-commerce",
    introduction:
      "Derrière la vitrine, j’ai développé les agents e-commerce et SAV, les parcours email, la recherche catalogue et la chaîne de suivi jusqu’à l’Analytics Hub.",
    desktop: "La boutique sur ordinateur",
    mobile: "La boutique sur mobile",
    desktopAlt:
      "Accueil français de Pedi-Sense sur ordinateur : navigation, présentation des chaussettes et accès à la fiche produit",
    mobileAlt:
      "Accueil français de Pedi-Sense sur mobile : menu compact, présentation du produit et bouton Découvrir",
    open: "Agrandir la capture",
    desktopLink: "Voir aussi la capture sur ordinateur",
    capture:
      "Boutique française sur ordinateur et mobile. Captures du 12 septembre 2026.",
    system: "Les agents et les parcours métier de Pedi-Sense",
    systemLead:
      "Les composants développés dans ce projet et leurs responsabilités respectives.",
    nodes: [
      {
        title: "Boutique et agent e-commerce",
        body: "Présentation du produit, variantes, langues et accès aux informations de catalogue, de stock et de commande.",
        detail:
          "Les API Shopify relient les informations produit et commande aux services métier.",
      },
      {
        title: "Agent SAV",
        body: "Traitement des demandes d’assistance avec recherche catalogue, politiques et FAQ de la boutique.",
        detail:
          "Le parcours comprend des brouillons à valider et une transmission à un opérateur.",
      },
      {
        title: "Emails et relation client",
        body: "Modèles aux couleurs de la marque pour les commandes, paniers abandonnés et expéditions.",
        detail:
          "Les parcours email développés utilisent Listmonk et les événements métier.",
      },
      {
        title: "Pixel et Analytics Hub",
        body: "Intégration d’un pixel maison pour les événements du parcours d’achat et leur transformation en KPI.",
        detail:
          "Événements de la boutique et des agents → agrégation → Analytics Hub.",
      },
    ],
  },
  en: {
    title: "From storefront to ecommerce services",
    introduction:
      "Behind the storefront, I developed ecommerce and support agents, email workflows, catalogue retrieval and the tracking pipeline into Analytics Hub.",
    desktop: "The desktop storefront",
    mobile: "The mobile storefront",
    desktopAlt:
      "French Pedi-Sense desktop homepage: navigation, sock presentation and access to the product page",
    mobileAlt:
      "French Pedi-Sense mobile homepage: compact menu, product presentation and Discover button",
    open: "View full-size screenshot",
    desktopLink: "View the desktop screenshot too",
    capture:
      "French storefront on desktop and mobile. Screenshots taken on 12 September 2026.",
    system: "Pedi-Sense agents and business workflows",
    systemLead:
      "The components developed for this project and their respective responsibilities.",
    nodes: [
      {
        title: "Storefront and ecommerce agent",
        body: "Product presentation, variants, languages and access to catalogue, stock and order information.",
        detail:
          "Shopify APIs connect product and order information to the business services.",
      },
      {
        title: "Customer-support agent",
        body: "Support-request handling with catalogue retrieval, store policies and FAQs.",
        detail:
          "The workflow includes draft responses for review and escalation to an operator.",
      },
      {
        title: "Emails and customer relationships",
        body: "Branded templates for order confirmations, abandoned carts and shipping notifications.",
        detail:
          "The email workflows developed use Listmonk and business events.",
      },
      {
        title: "Tracking pixel and Analytics Hub",
        body: "Custom pixel integration for purchase-path events and their transformation into KPIs.",
        detail: "Storefront and agent events → aggregation → Analytics Hub.",
      },
    ],
  },
};

export function PediOverview({ locale }: { locale: Locale }) {
  const text = copy[locale];
  return (
    <section
      className="section-shell pedi-overview"
      aria-labelledby="pedi-overview-title"
    >
      <h2 id="pedi-overview-title">{text.title}</h2>
      <p>{text.introduction}</p>
      <div className="pedi-gallery">
        <figure className="pedi-capture pedi-capture-desktop">
          <img
            src="/pedi-sense-desktop.jpg"
            alt={text.desktopAlt}
            width="1425"
            height="891"
            loading="lazy"
            decoding="async"
          />
          <figcaption>{text.desktop}</figcaption>
          <a className="text-link" href="/pedi-sense-desktop.jpg">
            {text.open}
          </a>
        </figure>
        <figure className="pedi-capture pedi-capture-mobile">
          <img
            src="/pedi-sense-mobile.jpg"
            alt={text.mobileAlt}
            width="375"
            height="812"
            loading="lazy"
            decoding="async"
          />
          <figcaption>{text.mobile}</figcaption>
          <a className="text-link" href="/pedi-sense-mobile.jpg">
            {text.open}
          </a>
        </figure>
      </div>
      <a className="text-link pedi-desktop-link" href="/pedi-sense-desktop.jpg">
        {text.desktopLink}
      </a>
      <p className="pedi-capture-note">{text.capture}</p>
      <div className="pedi-system" aria-labelledby="pedi-system-title">
        <h3 id="pedi-system-title">{text.system}</h3>
        <p>{text.systemLead}</p>
        <ul className="pedi-system-nodes">
          {text.nodes.map((node, index) => (
            <li key={node.title}>
              <span className="pedi-node-number" aria-hidden="true">
                0{index + 1}
              </span>
              <h4>{node.title}</h4>
              <p>{node.body}</p>
              <p className="pedi-node-detail">{node.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
