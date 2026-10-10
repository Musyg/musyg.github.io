import { localized, projectById, type Locale } from "./content/site";
import { projectPath } from "./routes";

const copy = {
  fr: {
    eyebrow: "Open source · Ingénierie système et réseau",
    title: "Bifrost, un VPN auto-hébergé en Rust.",
    introduction:
      "Je développe Bifrost pour Windows et Linux. Le travail ne s’arrête pas à établir un tunnel : il relie son cycle de vie au filtrage réseau, au DNS et aux services du système.",
    focus:
      "Un projet qui réunit architecture logicielle, intégration aux systèmes d’exploitation et tests des interruptions, reconnexions et fuites de trafic.",
    topics: ["WireGuard", "Filtrage réseau et DNS", "Tests anti-fuite"],
    discover: "Découvrir Bifrost",
    source: "Explorer le code",
  },
  en: {
    eyebrow: "Open source · Systems and network engineering",
    title: "Bifrost, a self-hosted VPN in Rust.",
    introduction:
      "I develop Bifrost for Windows and Linux. The work goes beyond establishing a tunnel: it connects its lifecycle to traffic filtering, DNS and system services.",
    focus:
      "A project bringing together software architecture, operating-system integration and tests for interruptions, reconnects and traffic leaks.",
    topics: ["WireGuard", "Network and DNS filtering", "Leak-prevention tests"],
    discover: "Explore Bifrost",
    source: "Browse the code",
  },
};

export function BifrostSpotlight({ locale }: { locale: Locale }) {
  const project = projectById("bifrost-vpn");
  if (!project) return null;
  const text = copy[locale];

  return (
    <section
      className="section-shell bifrost-spotlight"
      aria-labelledby="bifrost-spotlight-title"
    >
      <div className="bifrost-spotlight-brand">
        <img
          src={project.brandImage}
          alt=""
          width="1448"
          height="1086"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="bifrost-spotlight-copy">
        <p className="eyebrow">{text.eyebrow}</p>
        <h2 id="bifrost-spotlight-title">{text.title}</h2>
        <p>{text.introduction}</p>
        <p>{text.focus}</p>
        <ul
          className="bifrost-spotlight-topics"
          aria-label={localized(project.role, locale)}
        >
          {text.topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
        <div className="hero-actions">
          <a
            className="button button-primary"
            href={projectPath(project.id, locale)}
          >
            {text.discover}
          </a>
          <a className="text-link" href={project.links[0].url}>
            {text.source}
          </a>
        </div>
        <p className="bifrost-spotlight-status">
          {locale === "fr"
            ? "MVP public, en développement"
            : "Public MVP, in development"}
        </p>
      </div>
    </section>
  );
}
