import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../../src/App";

describe("App", () => {
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
