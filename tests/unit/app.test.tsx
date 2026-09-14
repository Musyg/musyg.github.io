import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../../src/App";

describe("App", () => {
  it.each([
    "/engineering/",
    "/fr/ingenierie/",
    "/work/",
    "/fr/realisations/",
    "/ai-systems/",
    "/fr/systemes-ia/",
  ])("shows ecommerce agents and their backend stack on %s", (pathname) => {
    const { container } = render(<App pathname={pathname} />);
    const cards = Array.from(container.querySelectorAll(".project-card"));
    for (const [title, technologies] of [
      [
        "Mika's Shop",
        ["Shopify", "Python", "FastAPI", "Shopify APIs", "SSE", "MQTT"],
      ],
      ["Pedi-Sense", ["Shopify", "Python", "Shopify APIs", "MQTT", "Listmonk"]],
    ] as const) {
      const card = cards.find(
        (element) => element.querySelector("h3")?.textContent === title,
      );
      expect(card).toBeDefined();
      for (const technology of technologies)
        expect(card).toHaveTextContent(technology);
    }
  });

  it.each(["/engineering/", "/fr/ingenierie/"])(
    "shows Inaricom's frontend and backend stack on %s",
    (pathname) => {
      const { container } = render(<App pathname={pathname} />);
      const card = Array.from(container.querySelectorAll(".project-card")).find(
        (element) => element.querySelector("h3")?.textContent === "Inaricom",
      );
      expect(card).toBeDefined();
      for (const technology of [
        "WordPress",
        "WooCommerce",
        "React",
        "TypeScript",
        "Vite",
        "PHP",
        "REST",
      ]) {
        expect(card).toHaveTextContent(technology);
      }
    },
  );

  it("renders the English homepage and its French counterpart", () => {
    render(<App pathname="/" />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Security research. AI engineering. Software systems.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View this page in French" }),
    ).toHaveAttribute("href", "/fr/");
  });

  it("renders a real French case-study route", () => {
    render(<App pathname="/fr/realisations/celo-credentials/" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Celo Credentials" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View this page in English" }),
    ).toHaveAttribute("href", "/work/celo-credentials/");
  });

  it("exposes verified public profiles without an email address", () => {
    const { container } = render(<App pathname="/contact/" />);
    expect(screen.getAllByRole("link", { name: /GitHub/ })[0]).toHaveAttribute(
      "href",
      "https://github.com/Musyg",
    );
    expect(container.textContent).not.toMatch(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/iu);
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });
});
