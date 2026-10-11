import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { InaricomOverview } from "../../src/InaricomOverview";
import { MikaOverview } from "../../src/MikaOverview";

afterEach(cleanup);

describe("project-specific agent overviews", () => {
  for (const locale of ["en", "fr"] as const) {
    it(`presents Inaricom's commerce, sales, retrieval and analytics in ${locale}`, () => {
      const { container } = render(<InaricomOverview locale={locale} />);
      expect(screen.getAllByRole("listitem")).toHaveLength(6);
      for (const term of [
        "DigiKey",
        "WooCommerce",
        "React",
        "FAISS",
        "Qdrant",
        "Analytics Hub",
        "PDF",
      ])
        expect(container.textContent).toContain(term);
      expect(
        screen.getByRole("heading", {
          name:
            locale === "fr"
              ? "Facturation et commandes"
              : "Invoicing and orders",
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          name:
            locale === "fr"
              ? "Closing et documents commerciaux"
              : "Closing and commercial documents",
        }),
      ).toBeInTheDocument();
      expect(container.textContent).toContain(
        locale === "fr" ? "validation opérateur" : "operator approval",
      );
      expect(container.textContent).toContain(
        locale === "fr" ? "en cours d’intégration" : "being integrated",
      );
      expect(container.textContent).not.toMatch(
        /Shopify|Pedi|Mika|Talos|herm[eè]s|mutualis|shared infrastructure/i,
      );
    });
    it(`preserves Mika's identity while adding business events and content in ${locale}`, () => {
      const { container } = render(<MikaOverview locale={locale} />);
      expect(screen.getAllByRole("listitem")).toHaveLength(4);
      expect(screen.getAllByRole("img")).toHaveLength(2);
      expect(container.textContent).toContain(
        locale === "fr" ? "le vrai chat" : "the real cat",
      );
      expect(container.textContent).toContain("Analytics Hub");
      expect(container.textContent).toContain(
        locale === "fr" ? "parcours éditorial" : "editorial workflow",
      );
      expect(container.textContent).not.toMatch(
        /Pedi|Inaricom|Talos|shared infrastructure|mutualis|Mika AI chat/i,
      );
    });
  }
});
