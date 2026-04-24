import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";
import { checkBotId } from "botid/server";
import { sendContactEmail } from "@/lib/server/contact-mail";

vi.mock("botid/server", () => ({
  checkBotId: vi.fn(),
}));

vi.mock("@/lib/server/contact-mail", () => ({
  sendContactEmail: vi.fn(),
}));

const checkBotIdMock = vi.mocked(checkBotId);
const sendContactEmailMock = vi.mocked(sendContactEmail);

function createRequest(body: unknown, origin = "http://localhost:3000") {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
      "x-forwarded-for": "203.0.113.5",
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  checkBotIdMock.mockResolvedValue({
    bypassed: false,
    isHuman: true,
    isBot: false,
    isVerifiedBot: false,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("POST /api/contact", () => {
  it("returns field errors for invalid submissions", async () => {
    const response = await POST(
      createRequest({
        name: "J",
        email: "invalid",
        company: "",
        message: "short",
        website: "",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      fieldErrors: {
        name: expect.any(Array),
        email: expect.any(Array),
        message: expect.any(Array),
      },
    });
  });

  it("treats the honeypot field as a successful no-op", async () => {
    const response = await POST(
      createRequest({
        name: "James Cadena",
        email: "james@example.com",
        company: "",
        message:
          "I would like to discuss a role focused on infrastructure security.",
        website: "https://spam.invalid",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
    expect(sendContactEmailMock).not.toHaveBeenCalled();
    expect(checkBotIdMock).toHaveBeenCalledTimes(1);
  });

  it("rejects submissions flagged by BotID", async () => {
    checkBotIdMock.mockResolvedValueOnce({
      bypassed: false,
      isHuman: false,
      isBot: true,
      isVerifiedBot: false,
    });

    const response = await POST(
      createRequest({
        name: "James Cadena",
        email: "james@example.com",
        company: "Acme",
        message:
          "I would like to talk about a role focused on secure infrastructure.",
        website: "",
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      message: expect.stringMatching(/access denied/i),
    });
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("rejects submissions from disallowed origins", async () => {
    const response = await POST(
      createRequest(
        {
          name: "James Cadena",
          email: "james@example.com",
          company: "Acme",
          message:
            "I would like to talk about a role focused on secure infrastructure.",
          website: "",
        },
        "https://evil.example",
      ),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      message: expect.stringMatching(/access denied/i),
    });
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("accepts submissions from the apex domain origin", async () => {
    sendContactEmailMock.mockResolvedValueOnce();

    const response = await POST(
      createRequest(
        {
          name: "James Cadena",
          email: "james@example.com",
          company: "Acme",
          message:
            "I would like to talk about a role focused on secure infrastructure.",
          website: "",
        },
        "https://cadena.sh",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
    expect(sendContactEmailMock).toHaveBeenCalledTimes(1);
  });

  it("accepts localhost submissions outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    sendContactEmailMock.mockResolvedValueOnce();

    const response = await POST(
      createRequest({
        name: "James Cadena",
        email: "james@example.com",
        company: "Acme",
        message:
          "I would like to talk about a role focused on secure infrastructure.",
        website: "",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
    expect(sendContactEmailMock).toHaveBeenCalledTimes(1);
  });

  it("rejects localhost submissions in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const response = await POST(
      createRequest({
        name: "James Cadena",
        email: "james@example.com",
        company: "Acme",
        message:
          "I would like to talk about a role focused on secure infrastructure.",
        website: "",
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      message: expect.stringMatching(/access denied/i),
    });
    expect(sendContactEmailMock).not.toHaveBeenCalled();
  });

  it("logs a sanitized failure in production when mail delivery fails", async () => {
    vi.stubEnv("NODE_ENV", "production");
    sendContactEmailMock.mockRejectedValueOnce(new Error("provider exploded"));
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const response = await POST(
      createRequest(
        {
          name: "James Cadena",
          email: "james@example.com",
          company: "Acme",
          message:
            "I would like to talk about a role focused on secure infrastructure.",
          website: "",
        },
        "https://james.cadena.sh",
      ),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      message: expect.stringMatching(/unable to send/i),
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Contact submission failed");
  });

  it("sends valid submissions", async () => {
    sendContactEmailMock.mockResolvedValueOnce();

    const response = await POST(
      createRequest({
        name: "James Cadena",
        email: "james@example.com",
        company: "Acme",
        message:
          "I would like to talk about a role focused on secure infrastructure.",
        website: "",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
    expect(checkBotIdMock).toHaveBeenCalledTimes(1);
    expect(sendContactEmailMock).toHaveBeenCalledWith({
      name: "James Cadena",
      email: "james@example.com",
      company: "Acme",
      message:
        "I would like to talk about a role focused on secure infrastructure.",
      website: "",
    });
  });
});
