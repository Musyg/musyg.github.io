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
          "Sur huit historiques synthétiques, la mémoire obtient 77 réussites sur 96, contre 29/96 pour une référence lexicale avec contrôle de validité. Le décompte inclut neuf résultats inconnus par configuration.",
        link: "Lire l’étude sur la continuité entre sessions",
        path: "benchmarks/answer-quality-20261029/",
      },
      {
        title: "Réutiliser l’expérience d’une autre tâche",
        description:
          "Une tâche est exécutée, son résultat est vérifié et une leçon en est extraite. La mémoire conserve cette expérience avec ses sources pour la retrouver lors d’une autre tâche, dans une nouvelle session.",
        result:
          "Dans l’étude synthétique, Luna réussit 22 tâches sur 24 avec la leçon, contre 13/24 avec la trace complète et le retour, et 7/24 sans expérience.",
        link: "Lire l’étude sur l’apprentissage entre tâches",
        path: "benchmarks/action-20261023/experience/",
      },
      {
        title: "Garder une mémoire cohérente après une correction ou une panne",
        description:
          "Conserver la trace des sources et de leurs versions, exclure les informations retirées et contrôler une ancienne sauvegarde avant de la réutiliser.",
        result:
          "Sur 100 scénarios de cycle de vie, les 751 lectures valides sont conservées et les 389 lectures interdites sont bloquées. La référence SQLite qui conserve une autorité actuelle obtient le même résultat. Les mesures détaillées comprennent les reprises après arrêt de processus.",
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
          "Across eight synthetic histories, memory achieves 77 successes out of 96, compared with 29/96 for a lexical baseline with validity checks. The counts include nine unknown outcomes per configuration.",
        link: "Read the cross-session continuity study",
        path: "benchmarks/answer-quality-20261029/",
      },
      {
        title: "Reuse experience from another task",
        description:
          "A task is performed, its result is checked and a lesson is extracted. Memory stores that experience with its sources for retrieval during a different task in a fresh session.",
        result:
          "In the synthetic study, Luna succeeds on 22 of 24 tasks with the lesson, compared with 13/24 with the complete trace and feedback, and 7/24 without experience.",
        link: "Read the learning-between-tasks study",
        path: "benchmarks/action-20261023/experience/",
      },
      {
        title: "Keep memory consistent after a correction or failure",
        description:
          "Trace information to its sources and versions, exclude withdrawn evidence and check an old backup before reusing it.",
        result:
          "Across 100 lifecycle scenarios, all 751 valid reads are preserved and all 389 forbidden reads are blocked. The SQLite reference retaining current authority achieves the same result. Detailed measurements include recovery after process termination.",
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
