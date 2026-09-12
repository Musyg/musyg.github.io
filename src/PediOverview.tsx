import { type Locale } from "./content/site";

const copy = {
  fr: {
    title: "De la boutique aux services e-commerce",
    introduction:
      "La vitrine présente le produit et son parcours d’achat. Derrière elle, j’ai développé les intégrations de service client, les modèles d’emails et la collecte des événements e-commerce.",
    desktop: "La boutique sur ordinateur",
    mobile: "La boutique sur mobile",
    desktopAlt:
      "Accueil français de Pedi-Sense sur ordinateur : navigation, présentation des chaussettes et accès à la fiche produit",
    mobileAlt:
      "Accueil français de Pedi-Sense sur mobile : menu compact, présentation du produit et bouton Découvrir",
    open: "Agrandir la capture",
    desktopLink: "Voir aussi la capture sur ordinateur",
    capture:
      "Vues de la boutique française, capturées le 12 septembre 2026. Le carrousel affiche deux visuels différents ; les couleurs et les contenus de la boutique sont conservés.",
    system: "La boutique, le SAV et les intégrations",
    systemLead:
      "Les composants développés dans ce projet et leurs responsabilités respectives.",
    nodes: [
      {
        title: "Boutique Shopify",
        body: "Présentation du produit, variantes, langues, panier et paiement.",
        detail:
          "Les API Shopify relient les informations produit et commande aux services métier.",
      },
      {
        title: "Agent SAV Hermes",
        body: "Traitement des demandes d’assistance et accès aux informations utiles à la réponse.",
        detail:
          "Le parcours comprend des brouillons à valider et une transmission à un opérateur.",
      },
      {
        title: "Emails et événements",
        body: "Modèles aux couleurs de la marque pour les commandes, paniers abandonnés et expéditions.",
        detail:
          "Intégration Listmonk pour les emails ; collecte et attribution des événements e-commerce.",
      },
    ],
  },
  en: {
    title: "From storefront to ecommerce services",
    introduction:
      "The storefront presents the product and purchase journey. Behind it, I developed customer-support integrations, email templates and ecommerce event collection.",
    desktop: "The desktop storefront",
    mobile: "The mobile storefront",
    desktopAlt:
      "French Pedi-Sense desktop homepage: navigation, sock presentation and access to the product page",
    mobileAlt:
      "French Pedi-Sense mobile homepage: compact menu, product presentation and Discover button",
    open: "View full-size screenshot",
    desktopLink: "View the desktop screenshot too",
    capture:
      "Views of the French storefront, captured on 12 September 2026. The carousel shows two different slides; the store’s original colors and content are preserved.",
    system: "Storefront, support and integrations",
    systemLead:
      "The components developed for this project and their respective responsibilities.",
    nodes: [
      {
        title: "Shopify storefront",
        body: "Product presentation, variants, languages, cart and checkout.",
        detail:
          "Shopify APIs connect product and order information to the business services.",
      },
      {
        title: "Hermes support agent",
        body: "Support-request handling and access to the information needed for a reply.",
        detail:
          "The workflow includes draft responses for review and escalation to an operator.",
      },
      {
        title: "Emails and events",
        body: "Branded templates for order confirmations, abandoned carts and shipping notifications.",
        detail:
          "Listmonk email integration; ecommerce event collection and attribution.",
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
