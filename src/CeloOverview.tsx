import { type Locale, type Project } from "./content/site";

const copy = {
  fr: {
    title: "Le projet en bref",
    need: "Le besoin",
    needText:
      "Recevoir une attestation de formation vérifiable sans devoir acheter de cryptomonnaie.",
    role: "Ma contribution",
    roleText:
      "J’ai conçu et réalisé le contrat, le backend de relais, l’intégration frontend et les tests.",
    result: "Le résultat sur testnet",
    flow: "De l’émission à la révocation",
    caption:
      "Parcours de l’application de référence. Le relais prend en charge les frais d’émission ; la vérification publique est une lecture de l’état du contrat.",
    steps: [
      [
        "Signer",
        "L’établissement autorisé signe une attestation hors chaîne (EIP-712).",
      ],
      [
        "Émettre",
        "Le relais soumet la transaction et paie les frais. Le contrat valide l’autorisation.",
      ],
      [
        "Vérifier",
        "L’attestation non transférable peut être vérifiée publiquement sur Celo.",
      ],
      [
        "Révoquer",
        "Le propriétaire du contrat ou l’émetteur d’origine encore autorisé peut la révoquer.",
      ],
    ],
  },
  en: {
    title: "The project at a glance",
    need: "The need",
    needText:
      "Receive a verifiable education credential without having to buy cryptocurrency.",
    role: "My contribution",
    roleText:
      "I designed and implemented the contract, relayer backend, frontend integration and tests.",
    result: "The testnet result",
    flow: "From issuance to revocation",
    caption:
      "Reference application flow. The relayer covers issuance fees; public verification reads the contract state.",
    steps: [
      [
        "Sign",
        "The authorized institution signs a credential voucher off-chain (EIP-712).",
      ],
      [
        "Issue",
        "The relayer submits the transaction and pays the fees. The contract validates the voucher.",
      ],
      [
        "Verify",
        "The non-transferable credential can be publicly verified on Celo.",
      ],
      [
        "Revoke",
        "The contract owner or the still-authorized original issuer can revoke it.",
      ],
    ],
  },
};

export function CeloOverview({
  locale,
  project,
}: {
  locale: Locale;
  project: Project;
}) {
  const text = copy[locale];
  return (
    <section
      className="section-shell celo-overview"
      aria-labelledby="celo-overview-title"
    >
      <h2 id="celo-overview-title">{text.title}</h2>
      <div className="celo-brief">
        <div>
          <h3>{text.need}</h3>
          <p>{text.needText}</p>
        </div>
        <div>
          <h3>{text.role}</h3>
          <p>{text.roleText}</p>
        </div>
        <div id="celo-credentials-results">
          <h3>{text.result}</h3>
          {project.sections.results[locale].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
      <figure className="celo-flow" aria-labelledby="celo-flow-title">
        <figcaption>
          <h3 id="celo-flow-title">{text.flow}</h3>
          <p>{text.caption}</p>
        </figcaption>
        <ol>
          {text.steps.map(([title, description], index) => (
            <li key={title}>
              <span className="celo-step" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h4>{title}</h4>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </figure>
    </section>
  );
}
