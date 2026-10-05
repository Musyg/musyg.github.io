import type { Locale } from "./content/site";
import {
  ipiArticle,
  ipiImage,
  ipiJudgeQuote,
  ipiPublishedAt,
} from "./content/ipi-article";
import { writingPath } from "./routes";

export function IpiArticle({ locale }: { locale: Locale }) {
  const copy = ipiArticle[locale];
  const fr = locale === "fr";
  return (
    <article className="research-article" aria-labelledby="article-title">
      <header>
        <a className="text-link" href={writingPath(locale)}>
          {fr ? "Toutes les publications" : "All writing"}
        </a>
        <p className="eyebrow">
          {fr
            ? "Étude de cas · Sécurité des agents IA"
            : "Case study · AI agent security"}
        </p>
        <h1 id="article-title">{copy.title}</h1>
        <p className="article-meta">
          Gilles Musy ·{" "}
          <time dateTime={ipiPublishedAt}>
            {fr ? "5 octobre 2026" : "October 5, 2026"}
          </time>{" "}
          · Gray Swan IPI August ’26
        </p>
        {copy.introduction.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </header>
      <nav
        className="article-contents"
        aria-label={fr ? "Sommaire de l’article" : "Article contents"}
      >
        {copy.sections.map((s) => (
          <a key={s.id} href={`#${s.id}`}>
            {s.title}
          </a>
        ))}
      </nav>
      {copy.sections.map((section) => (
        <section key={section.id} aria-labelledby={section.id}>
          <h2 id={section.id}>{section.title}</h2>
          {section.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {section.questions && (
            <ul>
              {section.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          )}
          {section.id === "verdict" && (
            <>
              <blockquote lang="en">
                <p>{ipiJudgeQuote}</p>
                <cite>Gray Swan · Mr. Swan</cite>
              </blockquote>
              <figure>
                <a
                  href={ipiImage}
                  aria-label={
                    fr
                      ? "Ouvrir la capture du verdict en grand"
                      : "Open the full-size verdict capture"
                  }
                >
                  <img
                    src={ipiImage}
                    alt={copy.verdictAlt}
                    width="1536"
                    height="506"
                    loading="lazy"
                  />
                </a>
                <figcaption>{copy.verdictCaption}</figcaption>
              </figure>
            </>
          )}
        </section>
      ))}
      <section aria-labelledby="article-sources">
        <h2 id="article-sources">
          {fr ? "Sources et cadre" : "Sources and scope"}
        </h2>
        <p>{copy.sourceNote}</p>
        <ul>
          <li>
            <a href="https://app.grayswan.ai/arena/challenge/ipi-aug-2026">
              Gray Swan · Indirect Prompt Injection August ’26
            </a>
          </li>
          <li>
            <a href="https://app.grayswan.ai/arena/about">
              {fr
                ? "Règles et présentation de l’Arena"
                : "Arena rules and overview"}
            </a>
          </li>
        </ul>
      </section>
    </article>
  );
}
