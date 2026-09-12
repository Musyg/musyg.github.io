import { type Locale } from "./content/site";

export const securityReportSource =
  "https://github.com/Musyg/stvault-audit/blob/5558eba7d33808c56fcd83f95ea0f043af56f0d0";

const copy = {
  fr: {
    title: "Du code au rapport",
    introduction:
      "J’examine le comportement des contrats, leurs contrôles d’accès et les hypothèses dont dépend leur fonctionnement. Le rapport relie les constats à leur impact et aux corrections proposées.",
    example: "StVault : un exemple de revue",
    context:
      "StVault est un coffre de prêt Solidity volontairement vulnérable, conçu pour démontrer une démarche de revue. Ce travail ne correspond pas à une mission client.",
    inspect: "Ce que j’examine",
    inspectText:
      "La validité des données de prix, la gestion des interactions externes et la précision du calcul des frais.",
    report: "Ce que contient le rapport",
    reportText:
      "Le périmètre étudié, les constats, leur impact, la justification de leur gravité, les références au code et les recommandations de correction.",
    caption: "Couverture du rapport public original, en anglais.",
    alt: "Couverture du rapport de démonstration StVault, par Gilles Musy",
    pdf: "Ouvrir le PDF (anglais)",
    markdown: "Lire la version texte (anglais)",
    repository: "Explorer le dépôt StVault",
    links: "Rapport et code de StVault",
  },
  en: {
    title: "From code to report",
    introduction:
      "I examine contract behavior, access controls and the assumptions that underpin their operation. The report connects findings to their impact and proposed corrections.",
    example: "StVault: a review example",
    context:
      "StVault is a deliberately vulnerable Solidity lending vault built to demonstrate a review workflow. This work is not a client engagement.",
    inspect: "What I examine",
    inspectText:
      "The validity of price data, the handling of external interactions and the precision of fee calculations.",
    report: "What the report contains",
    reportText:
      "The reviewed scope, findings, impact, severity rationale, code references and remediation recommendations.",
    caption: "Cover of the original public report, in English.",
    alt: "Cover of the StVault demonstration report by Gilles Musy",
    pdf: "Open the PDF",
    markdown: "Read the text version",
    repository: "Explore the StVault repository",
    links: "StVault report and code",
  },
};

export function SecurityOverview({ locale }: { locale: Locale }) {
  const text = copy[locale];
  return (
    <section
      className="section-shell security-overview"
      aria-labelledby="security-overview-title"
    >
      <h2 id="security-overview-title">{text.title}</h2>
      <p className="security-overview-lead">{text.introduction}</p>
      <div className="security-report-layout">
        <figure className="security-report-preview">
          <img
            src="/stvault-report-cover.png"
            alt={text.alt}
            width="679"
            height="960"
            loading="lazy"
            decoding="async"
          />
          <figcaption>{text.caption}</figcaption>
        </figure>
        <div className="security-report-details">
          <h3>{text.example}</h3>
          <p className="security-report-context">{text.context}</p>
          <dl>
            <div>
              <dt>{text.inspect}</dt>
              <dd>{text.inspectText}</dd>
            </div>
            <div>
              <dt>{text.report}</dt>
              <dd>{text.reportText}</dd>
            </div>
          </dl>
          <nav aria-label={text.links} className="security-report-links">
            <a
              className="button button-secondary"
              href={`${securityReportSource}/StVault_Security_Review.pdf`}
            >
              {text.pdf}
            </a>
            <a className="text-link" href={`${securityReportSource}/REPORT.md`}>
              {text.markdown}
            </a>
            <a
              className="text-link"
              href="https://github.com/Musyg/stvault-audit"
            >
              {text.repository}
            </a>
          </nav>
        </div>
      </div>
    </section>
  );
}
