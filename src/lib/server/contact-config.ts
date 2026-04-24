import "server-only";

import { createClient } from "@1password/sdk";

type ContactEnvName =
  | "RESEND_API_KEY"
  | "RESEND_FROM_EMAIL"
  | "RESEND_FROM_NAME"
  | "CONTACT_EMAIL_TO";

export type ContactMailConfig = {
  resendApiKey: string;
  resendFromEmail: string;
  resendFromName: string;
  contactEmailTo: string;
};

const REQUIRED_CONTACT_ENV_NAMES = [
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "RESEND_FROM_NAME",
  "CONTACT_EMAIL_TO",
] as const satisfies readonly ContactEnvName[];

const ONE_PASSWORD_ENVIRONMENT_TIMEOUT_MS = 4_000;

let cachedOnePasswordConfig: Promise<ContactMailConfig> | undefined;

function getRequiredProcessEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function buildContactMailConfig(
  getValue: (name: ContactEnvName) => string | undefined,
  missingMessage: (name: ContactEnvName) => string,
): ContactMailConfig {
  const values = Object.fromEntries(
    REQUIRED_CONTACT_ENV_NAMES.map((name) => {
      const value = getValue(name);

      if (!value) {
        throw new Error(missingMessage(name));
      }

      return [name, value];
    }),
  ) as Record<ContactEnvName, string>;

  return {
    resendApiKey: values.RESEND_API_KEY,
    resendFromEmail: values.RESEND_FROM_EMAIL,
    resendFromName: values.RESEND_FROM_NAME,
    contactEmailTo: values.CONTACT_EMAIL_TO,
  };
}

function getDirectContactMailConfig() {
  return buildContactMailConfig(
    (name) => process.env[name],
    (name) => `Missing required environment variable: ${name}`,
  );
}

async function withOnePasswordTimeout<T>(promise: Promise<T>) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Timed out loading 1Password Environment variables after ${ONE_PASSWORD_ENVIRONMENT_TIMEOUT_MS}ms`,
        ),
      );
    }, ONE_PASSWORD_ENVIRONMENT_TIMEOUT_MS);
  });

  return await Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

async function loadOnePasswordContactMailConfig() {
  const serviceAccountToken = getRequiredProcessEnv("OP_SERVICE_ACCOUNT_TOKEN");
  const environmentId = getRequiredProcessEnv("OP_ENVIRONMENT_ID");

  const client = await createClient({
    auth: serviceAccountToken,
    integrationName: "cadena.sh",
    integrationVersion: "0.1.0",
  });

  const response = await client.environments.getVariables(environmentId);
  const variables = new Map(
    response.variables.map((variable) => [variable.name, variable.value]),
  );

  return buildContactMailConfig(
    (name) => variables.get(name),
    (name) => `Missing required 1Password Environment variable: ${name}`,
  );
}

async function getOnePasswordContactMailConfig() {
  return await withOnePasswordTimeout(loadOnePasswordContactMailConfig());
}

export async function getContactMailConfig() {
  const hasServiceAccountToken = Boolean(process.env.OP_SERVICE_ACCOUNT_TOKEN);
  const hasEnvironmentId = Boolean(process.env.OP_ENVIRONMENT_ID);

  if (hasServiceAccountToken || hasEnvironmentId) {
    cachedOnePasswordConfig ??= getOnePasswordContactMailConfig().catch(
      (error: unknown) => {
        cachedOnePasswordConfig = undefined;
        throw error;
      },
    );
    return await cachedOnePasswordConfig;
  }

  return getDirectContactMailConfig();
}
