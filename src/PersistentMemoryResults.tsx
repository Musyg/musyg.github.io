import { publicLinkUrl, type Locale, type Project } from "./content/site";

const copy = {
  fr: {
    priorities: "Trois résultats à retenir",
    details: "Consulter les mesures détaillées et les essais d’intégration",
    studies: [
      {
        title: "Garder le fil entre les sessions",
        description:
          "Retrouver les informations utiles quand une mission reprend, en tenant compte des corrections et des changements intervenus depuis la session précédente.",
        result:
          "Sur huit historiques synthétiques, la mémoire obtient 77 réussites sur 96, contre 29/96 pour une référence lexicale avec contrôle de validité. Neuf résultats restent inconnus dans chaque configuration.",
        link: "Lire l’étude sur la continuité entre sessions",
        path: "benchmarks/answer-quality-20261029/",
      },
      {
        title: "Réutiliser l’expérience d’une autre tâche",
        description:
          "Une tâche est exécutée, son résultat est vérifié et une leçon en est extraite. Cette expérience peut ensuite être retrouvée pour aborder une autre tâche, dans une nouvelle session.",
        result:
          "Dans l’étude synthétique, Luna réussit 22 tâches sur 24 avec la leçon, contre 13/24 avec la trace complète et le retour, et 7/24 sans expérience. Le rapport présente aussi les résultats du second modèle et les fichiers produits.",
        link: "Lire l’étude sur l’apprentissage entre tâches",
        path: "benchmarks/action-20261023/experience/",
      },
      {
        title: "Garder une mémoire cohérente après une correction ou une panne",
        description:
          "Conserver la trace des sources et de leurs versions, exclure les informations retirées et contrôler une ancienne sauvegarde avant de la réutiliser.",
        result:
          "Sur 100 scénarios de cycle de vie, les 751 lectures valides sont conservées et les 389 lectures interdites sont bloquées. La référence SQLite qui conserve une autorité actuelle obtient le même résultat. Les tests de reprise après interruption sont documentés séparément ci-dessous.",
        link: "Lire l’étude sur les corrections et la reprise",
        path: "benchmarks/lifecycle-20261022/",
      },
    ],
  },
  en: {
    priorities: "Three results to take away",
    details: "Explore detailed measurements and integration observations",
    studies: [
      {
        title: "Keep the thread across sessions",
        description:
          "Retrieve useful information when a task resumes, taking account of corrections and changes since the previous session.",
        result:
          "Across eight synthetic histories, memory achieves 77 successes out of 96, compared with 29/96 for a lexical baseline with validity checks. Nine outcomes remain unknown in each configuration.",
        link: "Read the cross-session continuity study",
        path: "benchmarks/answer-quality-20261029/",
      },
      {
        title: "Reuse experience from another task",
        description:
          "A task is performed, its result is checked and a lesson is extracted. That experience can then be retrieved for a different task in a fresh session.",
        result:
          "In the synthetic study, Luna succeeds on 22 of 24 tasks with the lesson, compared with 13/24 with the complete trace and feedback, and 7/24 without experience. The report also provides the second model’s results and the actual files produced.",
        link: "Read the learning-between-tasks study",
        path: "benchmarks/action-20261023/experience/",
      },
      {
        title: "Keep memory consistent after a correction or failure",
        description:
          "Trace information to its sources and versions, exclude withdrawn evidence and check an old backup before reusing it.",
        result:
          "Across 100 lifecycle scenarios, all 751 valid reads are preserved and all 389 forbidden reads are blocked. The SQLite reference retaining current authority achieves the same result. Process-interruption recovery tests are documented separately below.",
        link: "Read the corrections and recovery study",
        path: "benchmarks/lifecycle-20261022/",
      },
    ],
  },
};

export function PersistentMemoryResults({
  locale,
  project,
}: {
  locale: Locale;
  project: Project;
}) {
  const content = copy[locale];
  return (
    <div className="memory-results">
      <ol className="memory-priorities" aria-label={content.priorities}>
        {content.studies.map((study) => {
          const source = project.links.find((link) =>
            link.url.includes(study.path),
          );
          return (
            <li key={study.path}>
              <h3>{study.title}</h3>
              <p>{study.description}</p>
              <p>{study.result}</p>
              {source && (
                <a className="text-link" href={publicLinkUrl(source, locale)}>
                  {study.link}
                </a>
              )}
            </li>
          );
        })}
      </ol>
      <details className="memory-measurements">
        <summary>{content.details}</summary>
        {project.sections.results[locale].map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </details>
    </div>
  );
}
