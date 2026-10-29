import { localized, professionalProfiles, type Locale } from "./content/site";
import { PlatformLogo } from "./PlatformLogo";

export function SecurityProfiles({ locale }: { locale: Locale }) {
  const isFrench = locale === "fr";
  const profiles = professionalProfiles.filter(
    (profile) => profile.platform !== "github",
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
          {isFrench ? "Profils et contributions" : "Profiles and contributions"}
        </h2>
      </div>
      <div className="profile-list">
        {profiles.map((profile) => (
          <a href={profile.url} key={profile.name}>
            <span className="profile-identity">
              <PlatformLogo platform={profile.platform} />
              <span className="profile-identity-text">
                <strong>{profile.name}</strong>
                <small>{profile.handle}</small>
              </span>
            </span>
            <span>{localized(profile.association, locale)}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
