import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PediOverview } from "../../src/PediOverview";

afterEach(cleanup);

describe("Pedi-Sense visual overview", () => {
  for (const locale of ["en", "fr"] as const) {
    it(`describes implemented storefront, support and email roles in ${locale}`, () => {
      const { container } = render(<PediOverview locale={locale} />);
      expect(screen.getAllByRole("img")).toHaveLength(2);
      expect(screen.getAllByRole("listitem")).toHaveLength(4);
      expect(container.textContent).toContain("Shopify");
      expect(container.textContent).not.toContain("Talos");
      expect(container.textContent).toContain("Listmonk");
      expect(container.textContent).toContain("Analytics Hub");
      expect(container.textContent).toContain("pixel");
      expect(container.textContent).toContain(
        locale === "fr" ? "développés" : "developed",
      );
      expect(container.textContent).not.toContain("hermes-agency");
      expect(container.textContent).not.toContain("Inaricom");
    });
  }
});
