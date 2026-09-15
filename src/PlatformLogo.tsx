import type { PlatformId } from "./content/site";

const assets: Record<PlatformId, string> = {
  github: "github.svg",
  "gray-swan": "gray-swan.png",
  hackerone: "hackerone.svg",
  cantina: "cantina.svg",
  code4rena: "code4rena.png",
};

export function PlatformLogo({ platform }: { platform: PlatformId }) {
  return (
    <img
      className={`platform-logo platform-logo--${platform}`}
      src={`/platforms/${assets[platform]}`}
      width="32"
      height="32"
      alt=""
      aria-hidden="true"
      decoding="async"
    />
  );
}
