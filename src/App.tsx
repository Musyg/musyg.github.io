import { useEffect, useRef, useState } from "react";
import {
  filterLabels,
  localized,
  practiceLabels,
  practicePages,
  professionalProfiles,
  projectById,
  projects,
  sectionLabels,
  sectionOrder,
  statusLabels,
  ui,
  type Locale,
  type Practice,
  type Project,
  type ProjectFilter,
} from "./content/site";
import {
  aboutPath,
  contactPath,
  homePath,
  practicePath,
  projectPath,
  routeFor,
  workPath,
  writingPath,
  type RouteEntry,
} from "./routes";
import "./App.css";

export interface AppProps {
  pathname?: string;
}

const selectedProjectIds = [
  "celo-credentials",
  "security-reviews",
  "agent-resilience",
  "inaricom",
];

const projectFilters: ProjectFilter[] = [
  "all",
  "software",
  "ai",
  "security",
  "web",
  "blockchain",
];

const evidenceItems = {
  en: [
    {
      title: "StVault v1.1.0",
      text: "Synchronized public report and PDF, current Foundry baseline, and green tests on both canonical branches.",
      url: "https://github.com/Musyg/stvault-audit",
    },
    {
      title: "Agent Resilience v0.1.0",
      text: "Circuit breaker, Redis-backed dead-letter queue, offline MQTT buffer, packaging, tests, and CI.",
      url: "https://github.com/Musyg/agent-resilience/releases/tag/v0.1.0",
    },
    {
      title: "Celo Credentials",
      text: "Source-verified Celo Sepolia deployment, demonstrated credential lifecycle, and 11/11 Foundry tests.",
      url: "https://github.com/Musyg/celo-credentials-dapp",
    },
  ],
  fr: [
    {
      title: "StVault v1.1.0",
      text: "Rapport public et PDF synchronisés, environnement Foundry actuel et tests réussis sur les deux branches canoniques.",
      url: "https://github.com/Musyg/stvault-audit",
    },
    {
      title: "Agent Resilience v0.1.0",
      text: "Circuit breaker, file de messages en échec adossée à Redis, tampon MQTT hors ligne, packaging, tests et CI.",
      url: "https://github.com/Musyg/agent-resilience/releases/tag/v0.1.0",
    },
    {
      title: "Celo Credentials",
      text: "Déploiement Celo Sepolia au code source vérifié, cycle d’attestation démontré et 11 tests Foundry réussis sur 11.",
      url: "https://github.com/Musyg/celo-credentials-dapp",
    },
  ],
};

function Header({ route }: { route: RouteEntry }) {
  const locale = route.locale;
  const content = ui[locale];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const current = (kind: RouteEntry["kind"]) =>
    route.kind === kind || (kind === "work" && route.kind === "project")
      ? "page"
      : undefined;

  const expertiseMenu = (mobile = false) => (
    <details
      className={
        mobile ? "expertise-menu expertise-menu-mobile" : "expertise-menu"
      }
    >
      <summary>{content.nav.expertise}</summary>
      <div className="expertise-options">
        {(["software", "ai", "security"] as Practice[]).map((practice) => (
          <a
            href={practicePath(practice, locale)}
            key={practice}
            aria-current={route.practice === practice ? "page" : undefined}
          >
            {localized(practiceLabels[practice], locale)}
          </a>
        ))}
      </div>
    </details>
  );

  const navigation = (mobile = false) => (
    <>
      <a href={workPath(locale)} aria-current={current("work")}>
        {content.nav.work}
      </a>
      {expertiseMenu(mobile)}
      <a href={writingPath(locale)} aria-current={current("writing")}>
        {content.nav.writing}
      </a>
      <a href={aboutPath(locale)} aria-current={current("about")}>
        {content.nav.about}
      </a>
      <a href={contactPath(locale)} aria-current={current("contact")}>
        {content.nav.contact}
      </a>
    </>
  );

  return (
    <header className="site-header">
      <a
        className="wordmark"
        href={homePath(locale)}
        aria-label={
          locale === "fr" ? "Gilles Musy, accueil" : "Gilles Musy, home"
        }
      >
        <img
          className="header-mark"
          src="/header-mark.svg"
          alt=""
          width="28"
          height="28"
          aria-hidden="true"
        />
        <span>Gilles Musy</span>
      </a>
      <nav className="desktop-nav" aria-label={content.navLabel}>
        {navigation()}
      </nav>
      <div className="header-actions">
        <a
          className="language-link"
          href={route.counterpart}
          hrefLang={locale === "en" ? "fr" : "en"}
          lang={locale === "en" ? "fr" : "en"}
          aria-label={content.languageLabel}
        >
          {content.language}
        </a>
        <button
          ref={menuButtonRef}
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? content.closeMenu : content.menu}
        </button>
      </div>
      <nav
        id="mobile-navigation"
        className="mobile-nav"
        aria-label={content.navLabel}
        hidden={!menuOpen}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) {
            setMenuOpen(false);
          }
        }}
      >
        {navigation(true)}
      </nav>
    </header>
  );
}

function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div>
        <a className="footer-wordmark" href={homePath(locale)}>
          Gilles Musy
        </a>
        <p>{ui[locale].roleLine}</p>
      </div>
      <nav
        aria-label={
          locale === "fr" ? "Profils professionnels" : "Professional profiles"
        }
      >
        {professionalProfiles.map((profile) => (
          <a href={profile.url} key={profile.name}>
            {profile.name}
          </a>
        ))}
      </nav>
    </footer>
  );
}

function StatusPill({ project, locale }: { project: Project; locale: Locale }) {
  return (
    <span className="status-pill">
      {localized(statusLabels[project.status], locale)}
    </span>
  );
}

function ProjectCard({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const content = ui[locale];

  return (
    <article className="project-card">
      <div className="project-card-topline">
        <StatusPill project={project} locale={locale} />
        <time dateTime={project.date}>{project.date}</time>
      </div>
      <p className="project-practice">
        {localized(practiceLabels[project.practice], locale)}
      </p>
      <h3>
        <a href={projectPath(project.id, locale)}>{project.title}</a>
      </h3>
      <p>{localized(project.summary, locale)}</p>
      <dl>
        <div>
          <dt>{content.role}</dt>
          <dd>{localized(project.role, locale)}</dd>
        </div>
        <div>
          <dt>{content.stack}</dt>
          <dd>{project.stack.slice(0, 4).join(" · ")}</dd>
        </div>
      </dl>
      <a className="text-link" href={projectPath(project.id, locale)}>
        {content.viewCaseStudy}
      </a>
    </article>
  );
}

function PageIntro({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <section className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-lead">{lead}</p>
    </section>
  );
}

function HomePage({ locale }: { locale: Locale }) {
  const isFrench = locale === "fr";
  const featured = selectedProjectIds
    .map((id) => projectById(id))
    .filter((project): project is Project => Boolean(project));
  const heroLines = isFrench
    ? ["Recherche en sécurité.", "Ingénierie IA.", "Systèmes logiciels."]
    : ["Security research.", "AI engineering.", "Software systems."];

  useEffect(() => {
    const syncVisibility = () => {
      document.body.classList.toggle("is-document-hidden", document.hidden);
    };

    document.addEventListener("visibilitychange", syncVisibility);
    syncVisibility();

    return () => {
      document.removeEventListener("visibilitychange", syncVisibility);
      document.body.classList.remove("is-document-hidden");
    };
  }, []);

  return (
    <>
      <section className="hero-section" aria-labelledby="hero-title">
        <svg
          className="hero-trace-field hero-trace-desktop"
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path className="hero-trace hero-trace-one" d="M0 132H238V254H418" />
          <path
            className="hero-trace hero-trace-two"
            d="M1000 86H826V198H694V318"
          />
          <path
            className="hero-trace hero-trace-three"
            d="M112 700V584H286V516H472"
          />
        </svg>
        <svg
          className="hero-trace-field hero-trace-mobile"
          viewBox="0 0 390 760"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path className="hero-trace hero-trace-one" d="M0 126H82V206H164" />
          <path
            className="hero-trace hero-trace-two"
            d="M390 264H304V348H242"
          />
          <path
            className="hero-trace hero-trace-three"
            d="M44 760V664H126V606H214"
          />
        </svg>
        <div className="hero-content">
          <p className="eyebrow">{ui[locale].roleLine}</p>
          <h1 id="hero-title" aria-label={heroLines.join(" ")}>
            {heroLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="hero-lead">
            {isFrench
              ? "Je travaille sur la sécurité applicative et les smart contracts, les systèmes d’IA agentiques et le développement full-stack."
              : "I work across application and smart-contract security, agentic AI systems, and full-stack development."}
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={workPath(locale)}>
              {isFrench ? "Voir les réalisations" : "View work"}
            </a>
            <a className="button button-secondary" href="#expertise">
              {isFrench ? "Explorer les expertises" : "Explore expertise"}
            </a>
          </div>
        </div>
        <div className="hero-index" aria-hidden="true">
          <span>01</span>
          <span className="hero-index-line" />
          <span>03</span>
        </div>
      </section>

      <section
        className="section-shell expertise-section"
        id="expertise"
        aria-labelledby="expertise-title"
      >
        <div className="section-heading">
          <p className="eyebrow">
            {isFrench
              ? "Trois pratiques distinctes"
              : "Three distinct practices"}
          </p>
          <h2 id="expertise-title">
            {isFrench
              ? "Un portfolio, des frontières professionnelles claires."
              : "One portfolio, clear professional boundaries."}
          </h2>
          <p>
            {isFrench
              ? "L’ingénierie, l’IA et la recherche en sécurité sont présentées séparément, avec des preuves publiques et des limites explicites."
              : "Engineering, AI, and security research are presented separately, with public evidence and explicit limitations."}
          </p>
        </div>
        <div className="practice-grid">
          {(["software", "ai", "security"] as Practice[]).map(
            (practice, index) => (
              <article className="practice-card" key={practice}>
                <span className="practice-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>
                  <a href={practicePath(practice, locale)}>
                    {localized(practicePages[practice].title, locale)}
                  </a>
                </h3>
                <p>{localized(practicePages[practice].lead, locale)}</p>
                <a className="text-link" href={practicePath(practice, locale)}>
                  {isFrench ? "Voir cette expertise" : "View this practice"}
                </a>
              </article>
            ),
          )}
        </div>
      </section>

      <section
        className="section-shell selected-section"
        aria-labelledby="selected-title"
      >
        <div className="section-heading compact-heading">
          <p className="eyebrow">
            {isFrench ? "Réalisations sélectionnées" : "Selected work"}
          </p>
          <h2 id="selected-title">
            {isFrench
              ? "Des preuves avant les promesses."
              : "Evidence before promises."}
          </h2>
          <p>
            {isFrench
              ? "Chaque projet indique son état, mon rôle, les preuves disponibles et ses limites."
              : "Each project states its status, my role, the available evidence, and its limitations."}
          </p>
        </div>
        <div className="project-grid">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} locale={locale} />
          ))}
        </div>
        <a
          className="button button-secondary section-action"
          href={workPath(locale)}
        >
          {isFrench ? "Toutes les réalisations" : "All work"}
        </a>
      </section>

      <section className="evidence-band" aria-labelledby="evidence-title">
        <div className="evidence-heading">
          <p className="eyebrow">
            {isFrench ? "Preuves publiques" : "Public evidence"}
          </p>
          <h2 id="evidence-title">
            {isFrench
              ? "Des signaux vérifiables."
              : "Signals that can be checked."}
          </h2>
        </div>
        <div className="evidence-grid">
          {evidenceItems[locale].map((item) => (
            <article key={item.title}>
              <span className="evidence-marker" aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <a href={item.url}>{ui[locale].viewEvidence}</a>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section-shell writing-preview"
        aria-labelledby="writing-preview-title"
      >
        <div>
          <p className="eyebrow">{isFrench ? "Publication" : "Writing"}</p>
          <h2 id="writing-preview-title">AI Adoption Playbook</h2>
        </div>
        <div>
          <p>
            {isFrench
              ? "Un guide interactif pour choisir entre assistance IA, automatisation, aide à la décision et agents métier autonomes, avec des pilotes, des contrôles et des exigences de gouvernance."
              : "An interactive guide for choosing between AI assistance, workflow automation, decision support, and autonomous business agents, with pilots, controls, and governance requirements."}
          </p>
          <a className="text-link" href={writingPath(locale)}>
            {isFrench ? "Voir la publication" : "View the publication"}
          </a>
        </div>
      </section>

      <section className="contact-cta" aria-labelledby="contact-cta-title">
        <p className="eyebrow">
          {isFrench ? "Contact professionnel" : "Professional contact"}
        </p>
        <h2 id="contact-cta-title">
          {isFrench
            ? "Échangeons autour d’un projet d’ingénierie, d’IA ou de recherche en sécurité."
            : "Discuss an engineering, AI, or security research project."}
        </h2>
        <a className="button button-primary" href={contactPath(locale)}>
          {isFrench ? "Profils professionnels" : "Professional profiles"}
        </a>
      </section>
    </>
  );
}

function WorkPage({ locale }: { locale: Locale }) {
  const content = ui[locale];
  const isFrench = locale === "fr";
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("all");

  useEffect(() => {
    const readFilter = () => {
      const requested = new URLSearchParams(window.location.search).get(
        "filter",
      ) as ProjectFilter | null;
      setActiveFilter(
        requested && projectFilters.includes(requested) ? requested : "all",
      );
    };

    readFilter();
    window.addEventListener("popstate", readFilter);
    return () => window.removeEventListener("popstate", readFilter);
  }, []);

  const updateFilter = (filter: ProjectFilter) => {
    const nextUrl = new URL(window.location.href);

    if (filter === "all") {
      nextUrl.searchParams.delete("filter");
    } else {
      nextUrl.searchParams.set("filter", filter);
    }

    window.history.pushState({}, "", nextUrl);
    setActiveFilter(filter);
  };

  const visible =
    activeFilter === "all"
      ? projects
      : projects.filter((project) => project.filters.includes(activeFilter));

  return (
    <>
      <PageIntro
        eyebrow={isFrench ? "Index des réalisations" : "Work index"}
        title={
          isFrench
            ? "Des réalisations documentées."
            : "Work with evidence attached."
        }
        lead={
          isFrench
            ? "Chaque entrée indique le rôle, l’état, les technologies, les preuves publiques et les limites restantes."
            : "Every entry states the role, status, technology, public evidence, and remaining limitations."
        }
      />
      <section
        className="section-shell work-index"
        aria-label={content.filters}
      >
        <div className="filter-group" role="group" aria-label={content.filters}>
          {projectFilters.map((filter) => {
            const selected = filter === activeFilter;
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={selected}
                onClick={() => updateFilter(filter)}
              >
                {localized(filterLabels[filter], locale)}
                {selected ? ` (${content.selected})` : ""}
              </button>
            );
          })}
        </div>
        {visible.length > 0 ? (
          <div className="project-grid work-grid">
            {visible.map((project) => (
              <ProjectCard key={project.id} project={project} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="empty-state">{content.noProjects}</p>
        )}
      </section>
    </>
  );
}

function ProjectPage({
  locale,
  project,
}: {
  locale: Locale;
  project: Project;
}) {
  const content = ui[locale];
  const currentIndex = projects.findIndex((item) => item.id === project.id);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  return (
    <>
      <section className="case-hero">
        <a className="back-link" href={workPath(locale)}>
          {content.backToWork}
        </a>
        <div className="case-hero-grid">
          <div>
            <p className="eyebrow">
              {localized(practiceLabels[project.practice], locale)}
            </p>
            {project.id === "security-reviews" ? (
              <img
                className="security-review-case-mark"
                src="/security-review-mark.svg"
                alt=""
                width="48"
                height="48"
                aria-hidden="true"
              />
            ) : null}
            <h1>{project.title}</h1>
            <p className="page-lead">{localized(project.summary, locale)}</p>
          </div>
          <dl className="metadata-rail">
            <div>
              <dt>{content.status}</dt>
              <dd>{localized(statusLabels[project.status], locale)}</dd>
            </div>
            <div>
              <dt>{content.role}</dt>
              <dd>{localized(project.role, locale)}</dd>
            </div>
            <div>
              <dt>{content.updated}</dt>
              <dd>
                <time dateTime={project.date}>{project.date}</time>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="case-layout">
        <aside className="case-stack" aria-label={content.stack}>
          <h2>{content.stack}</h2>
          <ul>
            {project.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
        <article className="case-body">
          {sectionOrder.map((section, index) => (
            <section key={section} aria-labelledby={`${project.id}-${section}`}>
              <span className="section-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 id={`${project.id}-${section}`}>
                {localized(sectionLabels[section], locale)}
              </h2>
              {project.sections[section][locale].map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section === "evidence" ? (
                <ul className="evidence-links">
                  {project.links.map((link) => (
                    <li key={link.url}>
                      <a href={link.url}>{localized(link.label, locale)}</a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </div>

      <section className="next-project">
        <p className="eyebrow">{content.nextProject}</p>
        <h2>{nextProject.title}</h2>
        <a
          className="button button-secondary"
          href={projectPath(nextProject.id, locale)}
        >
          {content.viewCaseStudy}
        </a>
      </section>
    </>
  );
}

function PracticePage({
  locale,
  practice,
}: {
  locale: Locale;
  practice: Practice;
}) {
  const page = practicePages[practice];
  const related = page.projectIds
    .map((id) => projectById(id))
    .filter((project): project is Project => Boolean(project));
  const isFrench = locale === "fr";

  return (
    <>
      <PageIntro
        eyebrow={isFrench ? "Expertise" : "Practice"}
        title={localized(page.title, locale)}
        lead={localized(page.lead, locale)}
      />
      <section className="section-shell practice-details">
        <div className="capability-list">
          <p className="eyebrow">{isFrench ? "Périmètre" : "Scope"}</p>
          <h2>{isFrench ? "Capacités appliquées" : "Applied capabilities"}</h2>
          <ul>
            {page.capabilities[locale].map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
        </div>
        <div className="evidence-list">
          <p className="eyebrow">
            {isFrench ? "Base publique" : "Public basis"}
          </p>
          <h2>{isFrench ? "Preuves et limites" : "Evidence and boundaries"}</h2>
          <ul>
            {page.evidence[locale].map((evidence) => (
              <li key={evidence}>{evidence}</li>
            ))}
          </ul>
        </div>
      </section>
      <section
        className="section-shell related-work"
        aria-labelledby="related-title"
      >
        <div className="section-heading compact-heading">
          <p className="eyebrow">
            {isFrench ? "Réalisations liées" : "Related work"}
          </p>
          <h2 id="related-title">
            {isFrench ? "Des exemples documentés." : "Documented examples."}
          </h2>
        </div>
        <div className="project-grid">
          {related.map((project) => (
            <ProjectCard key={project.id} project={project} locale={locale} />
          ))}
        </div>
      </section>
      {practice === "security" ? <SecurityProfiles locale={locale} /> : null}
    </>
  );
}

function SecurityProfiles({ locale }: { locale: Locale }) {
  const isFrench = locale === "fr";
  const profiles = professionalProfiles.filter(
    (profile) => profile.name !== "GitHub",
  );

  return (
    <section
      className="profile-section"
      aria-labelledby="security-profiles-title"
    >
      <div>
        <p className="eyebrow">
          {isFrench ? "Profils publics" : "Public profiles"}
        </p>
        <h2 id="security-profiles-title">
          {isFrench
            ? "Associations attribuables."
            : "Attributable associations."}
        </h2>
        <p>
          {isFrench
            ? "Les plateformes sont présentées sans nombre de constats, gravité ni détail technique non public."
            : "Platforms are presented without finding counts, severity, or non-public technical detail."}
        </p>
      </div>
      <div className="profile-list">
        {profiles.map((profile) => (
          <a href={profile.url} key={profile.name}>
            <span>
              <strong>{profile.name}</strong>
              <small>{profile.handle}</small>
            </span>
            <span>{localized(profile.association, locale)}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function WritingPage({ locale }: { locale: Locale }) {
  const isFrench = locale === "fr";

  return (
    <>
      <PageIntro
        eyebrow={isFrench ? "Publications techniques" : "Technical writing"}
        title={
          isFrench
            ? "Écrire pour rendre les choix vérifiables."
            : "Writing that makes decisions inspectable."
        }
        lead={
          isFrench
            ? "Les publications relient les choix d’architecture, les contrôles, les preuves et les limites au lieu de présenter une simple opinion."
            : "Publications connect architecture decisions, controls, evidence, and limitations instead of presenting an unsupported opinion."
        }
      />
      <section className="publication-feature">
        <div>
          <p className="eyebrow">
            {isFrench ? "Guide interactif public" : "Public interactive guide"}
          </p>
          <h2>AI Adoption Playbook</h2>
          <p>
            {isFrench
              ? "Le guide aide à choisir entre assistance IA, automatisation de processus, aide à la décision et agents métier autonomes. Il couvre des cas d’usage réalistes, la conception de pilotes, les preuves, les contrôles ainsi que les exigences applicables en Suisse et dans l’Union européenne."
              : "The guide helps choose between AI assistance, workflow automation, decision support, and autonomous business agents. It covers realistic use cases, pilot design, evidence, controls, and Swiss and EU governance requirements."}
          </p>
        </div>
        <div className="publication-actions">
          <a
            className="button button-primary"
            href={
              isFrench
                ? "https://musyg.github.io/ai-adoption-playbook/fr/"
                : "https://musyg.github.io/ai-adoption-playbook/"
            }
          >
            {isFrench ? "Ouvrir le guide" : "Open the guide"}
          </a>
          <a
            className="button button-secondary"
            href="https://github.com/Musyg/ai-adoption-playbook"
          >
            {isFrench ? "Voir le dépôt" : "View repository"}
          </a>
        </div>
      </section>
    </>
  );
}

function AboutPage({ locale }: { locale: Locale }) {
  const isFrench = locale === "fr";
  const principles = isFrench
    ? [
        [
          "Périmètre",
          "Je précise mon rôle, les limites de contribution et l’état réel du projet.",
        ],
        [
          "Preuves",
          "Je relie les affirmations aux dépôts, releases, tests, déploiements et profils publics.",
        ],
        [
          "Séparation",
          "La sécurité d’un système que je développe reste une responsabilité d’ingénierie, pas un audit externe.",
        ],
      ]
    : [
        [
          "Scope",
          "I state my role, contribution boundaries, and the project’s actual status.",
        ],
        [
          "Evidence",
          "I connect claims to public repositories, releases, tests, deployments, and profiles.",
        ],
        [
          "Separation",
          "Security work on a system I build remains engineering responsibility, not an external audit.",
        ],
      ];

  return (
    <>
      <PageIntro
        eyebrow={isFrench ? "À propos" : "About"}
        title={
          isFrench
            ? "Gilles Musy, basé en Suisse."
            : "Gilles Musy, based in Switzerland."
        }
        lead={
          isFrench
            ? "Je travaille à l’intersection de l’ingénierie logicielle, des systèmes d’IA agentiques et de la recherche en sécurité, sans confondre leurs méthodes ni leurs preuves."
            : "I work across software engineering, agentic AI systems, and security research without conflating their methods or evidence."
        }
      />
      <section className="section-shell principles-grid">
        {principles.map(([title, text], index) => (
          <article key={title}>
            <span className="section-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </>
  );
}

function ContactPage({ locale }: { locale: Locale }) {
  const isFrench = locale === "fr";

  return (
    <>
      <PageIntro
        eyebrow={isFrench ? "Contact professionnel" : "Professional contact"}
        title={
          isFrench
            ? "Utiliser un profil public vérifié."
            : "Use a verified public profile."
        }
        lead={
          isFrench
            ? "Cette première version n’expose aucune adresse email et n’affiche aucun faux formulaire. Les profils ci-dessous constituent les canaux publics disponibles."
            : "This first release exposes no email address and renders no simulated form. The profiles below are the available public channels."
        }
      />
      <section
        className="profile-section contact-profiles"
        aria-label={isFrench ? "Canaux publics" : "Public channels"}
      >
        <div>
          <h2>
            {isFrench
              ? "Choisir le contexte adapté."
              : "Choose the relevant context."}
          </h2>
          <p>
            {isFrench
              ? "GitHub convient aux projets et au code public. Les autres plateformes documentent les activités de recherche en sécurité qui leur sont propres."
              : "GitHub is appropriate for projects and public code. The other platforms document their respective security-research activity."}
          </p>
        </div>
        <div className="profile-list">
          {professionalProfiles.map((profile) => (
            <a href={profile.url} key={profile.name}>
              <span>
                <strong>{profile.name}</strong>
                <small>{profile.handle}</small>
              </span>
              <span>{localized(profile.association, locale)}</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

function NotFoundPage({ locale }: { locale: Locale }) {
  const content = ui[locale];

  return (
    <section className="not-found">
      <p className="error-code">404</p>
      <h1>{content.notFoundTitle}</h1>
      <p>{content.notFoundText}</p>
      <a className="button button-primary" href={homePath(locale)}>
        {content.homeAction}
      </a>
    </section>
  );
}

export default function App({ pathname }: AppProps) {
  const runtimePath =
    pathname ??
    (typeof window === "undefined" ? "/" : window.location.pathname);
  const route = routeFor(runtimePath);

  useEffect(() => {
    document.documentElement.lang = route.locale;
    document.title = route.title;
  }, [route.locale, route.title]);

  let page;

  switch (route.kind) {
    case "home":
      page = <HomePage locale={route.locale} />;
      break;
    case "work":
      page = <WorkPage locale={route.locale} />;
      break;
    case "project": {
      const project = route.projectId
        ? projectById(route.projectId)
        : undefined;
      page = project ? (
        <ProjectPage locale={route.locale} project={project} />
      ) : (
        <NotFoundPage locale={route.locale} />
      );
      break;
    }
    case "practice":
      page = route.practice ? (
        <PracticePage locale={route.locale} practice={route.practice} />
      ) : (
        <NotFoundPage locale={route.locale} />
      );
      break;
    case "writing":
      page = <WritingPage locale={route.locale} />;
      break;
    case "about":
      page = <AboutPage locale={route.locale} />;
      break;
    case "contact":
      page = <ContactPage locale={route.locale} />;
      break;
    default:
      page = <NotFoundPage locale={route.locale} />;
  }

  return (
    <>
      <a className="skip-link" href="#main">
        {ui[route.locale].skip}
      </a>
      <Header route={route} />
      <main id="main">{page}</main>
      <Footer locale={route.locale} />
    </>
  );
}
