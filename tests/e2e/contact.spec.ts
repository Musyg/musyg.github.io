import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Synthetic provider responses only. These tests do not prove email delivery.
for (const locale of ["fr", "en"]) {
  test(`protected contact ${locale} draft, responsive layout and @a11y`, async ({
    page,
  }) => {
    let sends = 0;
    await page.route("**/api/contact/config", (route) =>
      route.fulfill({
        json: { enabled: true, siteKey: "0x4AAAAAAEyVjBP2j0Xe8abI" },
      }),
    );
    await page.route(
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
      (route) =>
        route.fulfill({
          contentType: "text/javascript",
          body: `window.turnstile={render(node,options){window.contactTestOptions=options; setTimeout(()=>options.callback('local-test-token'),0);return 'test-widget';},remove(){},reset(){}};`,
        }),
    );
    await page.route("**/api/contact", (route) => {
      sends++;
      return route.fulfill({ status: 202, json: { code: "accepted" } });
    });
    await page.goto(locale === "fr" ? "/fr/contact/" : "/contact/");
    const form = page.getByRole("form");
    await expect(form).toBeVisible();
    const privacy = page.locator(".contact-privacy-details");
    await expect(privacy).not.toHaveAttribute("open");
    await expect(page.locator("#contact-privacy")).not.toContainText("Brevo");
    await privacy.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(privacy).toHaveAttribute("open", "");
    await expect(privacy.getByText(/Brevo/)).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await privacy.locator("summary").click();
    await expect(privacy).not.toHaveAttribute("open");
    await page
      .getByLabel(locale === "fr" ? "Nom" : "Name", { exact: true })
      .fill("Test User");
    await page
      .getByLabel(locale === "fr" ? "Votre email" : "Your email")
      .fill("visitor@example.com");
    const draft = "Synthetic local draft preserved through challenge expiry.";
    await page.getByLabel("Message", { exact: true }).fill(draft);
    await page.evaluate(() => {
      (
        window as unknown as { contactTestOptions: Record<string, () => void> }
      ).contactTestOptions["expired-callback"]();
    });
    await page
      .getByRole("button", {
        name:
          locale === "fr" ? "Relancer la vérification" : "Restart verification",
      })
      .click();
    await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
      draft,
    );
    const submit = page.getByRole("button", {
      name: locale === "fr" ? "Envoyer le message" : "Send message",
      exact: true,
    });
    await expect(submit).toBeEnabled();
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
    await submit.click();
    await expect(page.getByRole("status")).toContainText(
      locale === "fr"
        ? "Votre message a été envoyé"
        : "Your message has been sent",
    );
    expect(sends).toBe(1);
  });
}
