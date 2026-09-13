import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Locale } from "./content/site";
import "./ContactForm.css";

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
let loader: Promise<void> | undefined;
function loadWidget() {
  if (window.turnstile) return Promise.resolve();
  if (!loader)
    loader = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      const timeout = window.setTimeout(() => {
        script.remove();
        loader = undefined;
        reject(new Error("widget timeout"));
      }, 10000);
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => {
        window.clearTimeout(timeout);
        if (window.turnstile) resolve();
        else {
          loader = undefined;
          reject(new Error("widget missing"));
        }
      };
      script.onerror = () => {
        window.clearTimeout(timeout);
        script.remove();
        loader = undefined;
        reject(new Error("widget"));
      };
      document.head.append(script);
    });
  return loader;
}

export function ContactForm({ locale }: { locale: Locale }) {
  const fr = locale === "fr";
  const [siteKey, setSiteKey] = useState("");
  const [token, setToken] = useState("");
  const [state, setState] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const [widgetAttempt, setWidgetAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const abort = new AbortController();
    const timeout = window.setTimeout(() => abort.abort(), 8000);
    fetch("/api/contact/config", { signal: abort.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("unavailable");
        const config = await response.json();
        if (
          config.enabled !== true ||
          typeof config.siteKey !== "string" ||
          !/^0x[A-Za-z0-9_-]{20,40}$/.test(config.siteKey)
        )
          throw new Error("unavailable");
        if (!abort.signal.aborted) {
          setSiteKey(config.siteKey);
          setState("ready");
        }
      })
      .catch(() => {
        if (!abort.signal.aborted) setState("unavailable");
      })
      .finally(() => window.clearTimeout(timeout));
    abort.signal.addEventListener(
      "abort",
      () => {
        if (active) setState("unavailable");
      },
      {
        once: true,
      },
    );
    return () => {
      active = false;
      window.clearTimeout(timeout);
      abort.abort();
    };
  }, [attempt]);

  useEffect(() => {
    if (!siteKey) return;
    let alive = true;
    loadWidget()
      .then(() => {
        if (!alive || !widget.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(widget.current, {
          sitekey: siteKey,
          action: "contact",
          theme: "dark",
          language: locale,
          size: "flexible",
          callback: (value: string) => {
            setToken(value);
            setState((previous) =>
              ["verification", "loading"].includes(previous)
                ? "ready"
                : previous,
            );
          },
          "expired-callback": () => {
            setToken("");
            setState("verification");
          },
          "error-callback": () => {
            setToken("");
            setState("verification");
          },
        });
      })
      .catch(() => {
        if (alive) setState("verification");
      });
    return () => {
      alive = false;
      if (widgetId.current && window.turnstile)
        window.turnstile.remove(widgetId.current);
      widgetId.current = undefined;
      setToken("");
    };
  }, [siteKey, locale, widgetAttempt]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !token) return;
    busy.current = true;
    setPending(true);
    setState("ready");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
          website: data.get("website"),
          token,
          locale,
        }),
      });
      const result = await response.json();
      if (response.status === 202 && result.code === "accepted") {
        form.reset();
        setState("accepted");
      } else
        setState(
          response.status === 429
            ? "limited"
            : result.code === "verification"
              ? "verification"
              : "uncertain",
        );
    } catch {
      setState("uncertain");
    } finally {
      setToken("");
      setPending(false);
      busy.current = false;
      if (widgetId.current && window.turnstile)
        window.turnstile.reset(widgetId.current);
    }
  }
  const messages: Record<string, string> = fr
    ? {
        loading: "Vérification de la disponibilité du formulaire…",
        unavailable:
          "Le formulaire est momentanément indisponible. Les profils ci-dessous restent accessibles.",
        verification:
          "La vérification anti-spam doit être relancée avant l’envoi.",
        accepted:
          "Votre message a été transmis au service d’envoi. Merci pour votre prise de contact.",
        limited:
          "Trop de tentatives rapprochées. Merci de réessayer plus tard.",
        uncertain:
          "L’envoi n’a pas pu être confirmé. Pour éviter un doublon, ne renvoyez pas immédiatement le même message.",
      }
    : {
        loading: "Checking form availability…",
        unavailable:
          "The form is temporarily unavailable. The profiles below remain accessible.",
        verification: "Please restart the spam check before sending.",
        accepted:
          "Your message was accepted by the sending service. Thank you for getting in touch.",
        limited: "Too many attempts in a short period. Please try again later.",
        uncertain:
          "Sending could not be confirmed. To avoid a duplicate, please do not immediately send the same message again.",
      };
  return (
    <section
      className="profile-section contact-form-section"
      aria-labelledby="contact-form-title"
    >
      <h2 id="contact-form-title">
        {fr ? "Échangeons sur votre projet." : "Let’s talk about your project."}
      </h2>
      <p>
        {fr
          ? "Une mission, une opportunité professionnelle ou une question sur mes travaux ? Présentez-moi le contexte et ce que vous recherchez."
          : "A project, a professional opportunity or a question about my work? Tell me about the context and what you have in mind."}
      </p>
      <p role="status" aria-live="polite">
        {pending
          ? fr
            ? "Envoi en cours…"
            : "Sending…"
          : (messages[state] ?? "")}
      </p>
      {!siteKey ? (
        <button
          className="button"
          type="button"
          disabled={state === "loading"}
          onClick={() => {
            setState("loading");
            setAttempt((value) => value + 1);
          }}
        >
          {fr ? "Réessayer" : "Try again"}
        </button>
      ) : (
        <form
          aria-label={fr ? "Envoyer un message" : "Send a message"}
          onSubmit={submit}
          aria-describedby="contact-privacy"
        >
          <fieldset disabled={pending}>
            <div className="contact-fields">
              <label>
                {fr ? "Nom" : "Name"}
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </label>
              <label>
                {fr ? "Votre email" : "Your email"}
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>
            </div>
            <label>
              {fr ? "Sujet" : "Subject"}
              <select name="subject" defaultValue="project">
                <option value="project">
                  {fr ? "Projet ou mission" : "Project or contract"}
                </option>
                <option value="job">
                  {fr
                    ? "Opportunité professionnelle"
                    : "Professional opportunity"}
                </option>
                <option value="research">
                  {fr ? "Recherche" : "Research"}
                </option>
                <option value="other">{fr ? "Autre" : "Other"}</option>
              </select>
            </label>
            <label>
              {fr ? "Message" : "Message"}
              <textarea
                name="message"
                rows={7}
                minLength={20}
                maxLength={5000}
                required
              />
            </label>
            <div className="contact-honeypot" aria-hidden="true">
              <label>
                Website
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  maxLength={200}
                />
              </label>
            </div>
          </fieldset>
          <p id="contact-privacy">
            {fr
              ? "Vos informations servent à traiter votre demande. L’acheminement utilise Brevo et la réception ma messagerie professionnelle. N’envoyez ni mot de passe, ni document confidentiel. La protection anti-spam utilise "
              : "Your information is used to respond to your enquiry. Delivery uses Brevo and my professional mailbox. Do not send passwords or confidential documents. Spam protection uses "}
            <a href="https://www.cloudflare.com/privacypolicy/">
              Cloudflare Turnstile
            </a>
            .
          </p>
          <div ref={widget} className="contact-widget" />
          {state === "verification" && (
            <button
              type="button"
              className="button"
              disabled={pending}
              onClick={() => {
                setState("loading");
                setToken("");
                setWidgetAttempt((value) => value + 1);
              }}
            >
              {fr ? "Relancer la vérification" : "Restart verification"}
            </button>
          )}
          <button
            type="submit"
            className="button button-primary"
            disabled={pending || !token}
          >
            {fr ? "Envoyer le message" : "Send message"}
          </button>
        </form>
      )}
      <noscript>
        {fr
          ? "JavaScript est nécessaire pour le formulaire protégé. Vous pouvez consulter mes profils ci-dessous."
          : "JavaScript is required for the protected form. You can use the profiles below."}
      </noscript>
    </section>
  );
}
