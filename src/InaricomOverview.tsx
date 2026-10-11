import { type Locale } from "./content/site";

const copy = {
  fr: {
    title: "Le site et ses agents métier",
    introduction:
      "Je développe Inaricom du site aux services qui accompagnent son activité : catalogue fournisseur, agents e-commerce et commerciaux, devis, facturation, assistance et analyse des événements.",
    nodes: [
      {
        title: "Site et catalogue",
        body: "WordPress/WooCommerce, interfaces React et intégration DigiKey. L’agent e-commerce accède aux informations de produit, de stock et de commande.",
        detail: "Le backend relie le catalogue aux parcours métier.",
      },
      {
        title: "Agents commerciaux",
        body: "Prospection, qualification et négociation, avec suivi des demandes et transmission du contexte à l’agent de closing.",
        detail: "Demande → qualification → négociation → closing.",
      },
      {
        title: "Conclusion des ventes et documents commerciaux",
        body: "Préparation des devis et contrats, validation opérateur et suivi de l’acceptation du client. La chaîne est en cours d’intégration.",
        detail:
          "Le dossier conserve le contexte commercial et les étapes de validation.",
      },
      {
        title: "Facturation et commandes",
        body: "Développement de modules de facturation PDF, reliés aux commandes WooCommerce et au contexte du devis accepté.",
        detail:
          "Le document archivé reste rattaché au devis, à la commande et au reçu de paiement.",
      },
      {
        title: "RAG et assistance",
        body: "Recherche sémantique du catalogue avec FAISS, connaissances e-commerce et documents SAV avec Qdrant.",
        detail:
          "Les informations retrouvées apportent le contexte aux réponses.",
      },
      {
        title: "Pixel et Analytics Hub",
        body: "Pixel WooCommerce développé sur mesure, collecte d’événements et transmission de KPI aux services d’analyse.",
        detail:
          "Événements du site et des agents → agrégation → Analytics Hub.",
      },
    ],
  },
  en: {
    title: "The website and its business agents",
    introduction:
      "I develop Inaricom from the website to its business services: supplier catalogue, ecommerce and sales agents, quotes, invoicing, support and event analytics.",
    nodes: [
      {
        title: "Website and catalogue",
        body: "WordPress/WooCommerce, React interfaces and DigiKey integration. The ecommerce agent accesses product, stock and order information.",
        detail: "The backend connects the catalogue to business workflows.",
      },
      {
        title: "Sales agents",
        body: "Prospecting, qualification and negotiation, with request tracking and context handed to the closing agent.",
        detail: "Request → qualification → negotiation → closing.",
      },
      {
        title: "Closing and commercial documents",
        body: "Quote and contract preparation, operator approval and tracking of client acceptance. The chain is being integrated.",
        detail: "The case retains its commercial context and approval steps.",
      },
      {
        title: "Invoicing and orders",
        body: "Development of PDF invoicing modules linked to WooCommerce orders and the accepted quote context.",
        detail:
          "The archived document remains linked to the quote, order and payment receipt.",
      },
      {
        title: "RAG and support",
        body: "Semantic catalogue retrieval with FAISS, ecommerce knowledge and support documents with Qdrant.",
        detail: "Retrieved information provides context for replies.",
      },
      {
        title: "Tracking pixel and Analytics Hub",
        body: "Custom WooCommerce pixel implementation, event collection and KPI delivery to analytics services.",
        detail: "Website and agent events → aggregation → Analytics Hub.",
      },
    ],
  },
};

export function InaricomOverview({ locale }: { locale: Locale }) {
  const text = copy[locale];
  return (
    <section
      className="section-shell inaricom-overview"
      aria-labelledby="inaricom-overview-title"
    >
      <h2 id="inaricom-overview-title">{text.title}</h2>
      <p>{text.introduction}</p>
      <ul className="pedi-system-nodes">
        {text.nodes.map((node, index) => (
          <li key={node.title}>
            <span className="pedi-node-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{node.title}</h3>
            <p>{node.body}</p>
            <p className="pedi-node-detail">{node.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
