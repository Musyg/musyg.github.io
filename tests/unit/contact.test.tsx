import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "../../src/ContactForm";

afterEach(() => {
  vi.unstubAllGlobals();
  delete window.turnstile;
});
function mockContact() {
  let onToken: (token: string) => void = () => {};
  window.turnstile = {
    render: vi.fn((_node, options) => {
      onToken = options.callback as typeof onToken;
      return "test-widget";
    }),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  const fetchMock = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      enabled: true,
      siteKey: "0x4AAAAAAEyVjBP2j0Xe8abI",
    }),
  });
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, token: () => act(() => onToken("local-test-token")) };
}
describe("protected contact", () => {
  it("does not show a form when server configuration is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ enabled: false }),
      }),
    );
    render(<ContactForm locale="fr" />);
    expect(
      await screen.findByText(/momentanément indisponible/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });
  it("renders French labels, requires a token and acknowledges only provider acceptance", async () => {
    const mock = mockContact();
    mock.fetchMock.mockResolvedValueOnce({
      status: 202,
      json: async () => ({ code: "accepted" }),
    });
    const { container } = render(<ContactForm locale="fr" />);
    const form = await screen.findByRole("form", {
      name: "Envoyer un message",
    });
    expect(
      screen.getByRole("button", { name: "Envoyer le message" }),
    ).toBeDisabled();
    await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalled());
    fireEvent.change(screen.getByLabelText("Nom"), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText("Votre email"), {
      target: { value: "visitor@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Message de test purement local." },
    });
    mock.token();
    fireEvent.submit(form);
    expect(
      await screen.findByText(/transmis au service d’envoi/),
    ).toBeInTheDocument();
    mock.token();
    expect(screen.getByText(/transmis au service d’envoi/)).toBeInTheDocument();
    const payload = JSON.parse(mock.fetchMock.mock.calls[1][1].body);
    expect(payload.locale).toBe("fr");
    expect(payload.to).toBeUndefined();
    expect(container.innerHTML).not.toContain("inaricom.com");
  });
  it("keeps English draft and gives an honest ambiguous-failure message", async () => {
    const mock = mockContact();
    mock.fetchMock.mockRejectedValueOnce(new Error("network"));
    render(<ContactForm locale="en" />);
    const form = await screen.findByRole("form", { name: "Send a message" });
    await waitFor(() => expect(window.turnstile?.render).toHaveBeenCalled());
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "A draft worth preserving after an error." },
    });
    mock.token();
    fireEvent.submit(form);
    expect(
      await screen.findByText(/Sending could not be confirmed/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toHaveValue(
      "A draft worth preserving after an error.",
    );
    expect(mock.fetchMock).toHaveBeenCalledTimes(2);
  });
});
