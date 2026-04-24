import { afterEach, describe, expect, it, vi } from "vitest";

import type { ContactSubmission } from "@/lib/contact";

vi.mock("server-only", () => ({}));

const resendSendMock = vi.fn();
const resendConstructorMock = vi.fn(function ResendMock() {
  return {
    emails: {
      send: resendSendMock,
    },
  };
});
const getContactMailConfigMock = vi.fn();

vi.mock("resend", () => ({
  Resend: resendConstructorMock,
}));

vi.mock("@/lib/server/contact-config", () => ({
  getContactMailConfig: getContactMailConfigMock,
}));

async function importModule() {
  return await import("./contact-mail");
}

const submission: ContactSubmission = {
  name: "James\nCadena",
  email: "james@example.com",
  company: "Acme <Ops>",
  message: "I would like to talk about infrastructure security work.",
  website: "",
};

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe("sendContactEmail", () => {
  it("sends mail with 1Password-backed contact mail config", async () => {
    getContactMailConfigMock.mockResolvedValue({
      resendApiKey: "re_1password",
      resendFromEmail: "hello@cadena.sh",
      resendFromName: "cadena.sh",
      contactEmailTo: "james@example.com",
    });
    resendSendMock.mockResolvedValue({ error: null });

    const { sendContactEmail } = await importModule();

    await sendContactEmail(submission);

    expect(resendConstructorMock).toHaveBeenCalledWith("re_1password");
    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "cadena.sh <hello@cadena.sh>",
        to: ["james@example.com"],
        replyTo: "james@example.com",
        subject: "cadena.sh contact: James Cadena",
        text: expect.stringContaining("Company: Acme <Ops>"),
        html: expect.stringContaining("Acme &lt;Ops&gt;"),
      }),
    );
  });

  it("throws a generic error when Resend returns a provider error", async () => {
    getContactMailConfigMock.mockResolvedValue({
      resendApiKey: "re_1password",
      resendFromEmail: "hello@cadena.sh",
      resendFromName: "cadena.sh",
      contactEmailTo: "james@example.com",
    });
    const providerError = { name: "provider_error", message: "bad key" };
    resendSendMock.mockResolvedValue({ error: providerError });

    const { sendContactEmail } = await importModule();

    await expect(sendContactEmail(submission)).rejects.toThrow(
      "Resend request failed",
    );
  });
});
