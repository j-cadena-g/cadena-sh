import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getVariablesMock = vi.fn();
const createClientMock = vi.fn();

vi.mock("@1password/sdk", () => ({
  createClient: createClientMock,
}));

async function importModule() {
  return await import("./contact-config");
}

function stubDirectContactEnv() {
  vi.stubEnv("RESEND_API_KEY", "re_direct");
  vi.stubEnv("RESEND_FROM_EMAIL", "hello@example.com");
  vi.stubEnv("RESEND_FROM_NAME", "Example Contact Form");
  vi.stubEnv("CONTACT_EMAIL_TO", "inbox@example.com");
}

function stubOnePasswordEnv() {
  vi.stubEnv("OP_SERVICE_ACCOUNT_TOKEN", "ops_test_token");
  vi.stubEnv("OP_ENVIRONMENT_ID", "env_test_id");
}

afterEach(() => {
  vi.useRealTimers();
  vi.resetModules();
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe("getContactMailConfig", () => {
  it("falls back to direct environment variables when 1Password runtime config is absent", async () => {
    stubDirectContactEnv();

    const { getContactMailConfig } = await importModule();

    await expect(getContactMailConfig()).resolves.toEqual({
      resendApiKey: "re_direct",
      resendFromEmail: "hello@example.com",
      resendFromName: "Example Contact Form",
      contactEmailTo: "inbox@example.com",
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("loads contact mail config from 1Password Environments when service account settings are present", async () => {
    stubDirectContactEnv();
    stubOnePasswordEnv();
    getVariablesMock.mockResolvedValue({
      variables: [
        { name: "RESEND_API_KEY", value: "re_1password", masked: true },
        {
          name: "RESEND_FROM_EMAIL",
          value: "hello@cadena.sh",
          masked: false,
        },
        { name: "RESEND_FROM_NAME", value: "cadena.sh", masked: false },
        {
          name: "CONTACT_EMAIL_TO",
          value: "james@example.com",
          masked: true,
        },
      ],
    });
    createClientMock.mockResolvedValue({
      environments: {
        getVariables: getVariablesMock,
      },
    });

    const { getContactMailConfig } = await importModule();

    await expect(getContactMailConfig()).resolves.toEqual({
      resendApiKey: "re_1password",
      resendFromEmail: "hello@cadena.sh",
      resendFromName: "cadena.sh",
      contactEmailTo: "james@example.com",
    });
    expect(createClientMock).toHaveBeenCalledWith({
      auth: "ops_test_token",
      integrationName: "cadena.sh",
      integrationVersion: "0.1.0",
    });
    expect(getVariablesMock).toHaveBeenCalledWith("env_test_id");
  });

  it("caches 1Password Environment reads within a warm server instance", async () => {
    stubOnePasswordEnv();
    getVariablesMock.mockResolvedValue({
      variables: [
        { name: "RESEND_API_KEY", value: "re_1password", masked: true },
        {
          name: "RESEND_FROM_EMAIL",
          value: "hello@cadena.sh",
          masked: false,
        },
        { name: "RESEND_FROM_NAME", value: "cadena.sh", masked: false },
        {
          name: "CONTACT_EMAIL_TO",
          value: "james@example.com",
          masked: true,
        },
      ],
    });
    createClientMock.mockResolvedValue({
      environments: {
        getVariables: getVariablesMock,
      },
    });

    const { getContactMailConfig } = await importModule();

    await getContactMailConfig();
    await getContactMailConfig();

    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(getVariablesMock).toHaveBeenCalledTimes(1);
  });

  it("fails fast when 1Password Environment loading exceeds the runtime timeout", async () => {
    vi.useFakeTimers();
    stubOnePasswordEnv();
    createClientMock.mockReturnValue(new Promise(() => {}));

    const { getContactMailConfig } = await importModule();

    const configPromise = getContactMailConfig().then(
      () => "resolved",
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(4_000);
    const result = await Promise.race([
      configPromise,
      Promise.resolve("still pending"),
    ]);

    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe(
      "Timed out loading 1Password Environment variables after 4000ms",
    );
  });

  it("does not cache failed 1Password Environment reads", async () => {
    stubOnePasswordEnv();
    getVariablesMock
      .mockRejectedValueOnce(new Error("temporary 1Password outage"))
      .mockResolvedValueOnce({
        variables: [
          { name: "RESEND_API_KEY", value: "re_1password", masked: true },
          {
            name: "RESEND_FROM_EMAIL",
            value: "hello@cadena.sh",
            masked: false,
          },
          { name: "RESEND_FROM_NAME", value: "cadena.sh", masked: false },
          {
            name: "CONTACT_EMAIL_TO",
            value: "james@example.com",
            masked: true,
          },
        ],
      });
    createClientMock.mockResolvedValue({
      environments: {
        getVariables: getVariablesMock,
      },
    });

    const { getContactMailConfig } = await importModule();

    await expect(getContactMailConfig()).rejects.toThrow(
      "temporary 1Password outage",
    );
    await expect(getContactMailConfig()).resolves.toMatchObject({
      resendApiKey: "re_1password",
    });
    expect(getVariablesMock).toHaveBeenCalledTimes(2);
  });

  it("fails closed when only one 1Password runtime setting is configured", async () => {
    vi.stubEnv("OP_SERVICE_ACCOUNT_TOKEN", "ops_test_token");
    stubDirectContactEnv();

    const { getContactMailConfig } = await importModule();

    await expect(getContactMailConfig()).rejects.toThrow(
      "Missing required environment variable: OP_ENVIRONMENT_ID",
    );
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("fails closed when the 1Password Environment is missing a required contact variable", async () => {
    stubOnePasswordEnv();
    getVariablesMock.mockResolvedValue({
      variables: [
        { name: "RESEND_API_KEY", value: "re_1password", masked: true },
      ],
    });
    createClientMock.mockResolvedValue({
      environments: {
        getVariables: getVariablesMock,
      },
    });

    const { getContactMailConfig } = await importModule();

    await expect(getContactMailConfig()).rejects.toThrow(
      "Missing required 1Password Environment variable: RESEND_FROM_EMAIL",
    );
  });
});
