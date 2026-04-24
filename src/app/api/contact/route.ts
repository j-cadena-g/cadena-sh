import { checkBotId } from "botid/server";
import { z } from "zod";

import { contactSubmissionSchema } from "@/lib/contact";
import { getAllowedContactOrigins } from "@/lib/site";
import { sendContactEmail } from "@/lib/server/contact-mail";

export const runtime = "nodejs";

function hasAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    return getAllowedContactOrigins().has(new URL(origin).origin);
  } catch {
    return false;
  }
}

function describeErrorChain(error: unknown): string {
  const parts: string[] = [];
  let current: unknown = error;
  const seen = new Set<unknown>();

  while (current && !seen.has(current)) {
    seen.add(current);

    if (current instanceof Error) {
      parts.push(current.message);
      current = (current as { cause?: unknown }).cause;
      continue;
    }

    parts.push(String(current));
    break;
  }

  return parts.length > 0 ? parts.join(" ← ") : "Unknown error";
}

function logContactFailure(error: unknown) {
  // Production logs are intentionally shapeless: no message, no stack, no
  // cause — just a marker that something failed. Dev logs are verbose so the
  // underlying provider error is easy to chase down locally.
  if (process.env.NODE_ENV !== "production") {
    console.error("Contact submission failed", {
      message: describeErrorChain(error),
    });
    return;
  }

  console.error("Contact submission failed");
}

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request)) {
    return Response.json(
      {
        ok: false,
        message: "Access denied.",
      },
      { status: 403 },
    );
  }

  const verification = await checkBotId();

  if (verification.isBot) {
    return Response.json(
      {
        ok: false,
        message: "Access denied.",
      },
      { status: 403 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      {
        ok: false,
        message: "Invalid request payload.",
      },
      { status: 400 },
    );
  }

  const result = contactSubmissionSchema.safeParse(payload);

  if (!result.success) {
    return Response.json(
      {
        ok: false,
        fieldErrors: z.flattenError(result.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  if (result.data.website) {
    return Response.json({ ok: true });
  }

  try {
    await sendContactEmail(result.data);

    return Response.json({ ok: true });
  } catch (error) {
    logContactFailure(error);

    return Response.json(
      {
        ok: false,
        message: "Unable to send your message right now.",
      },
      { status: 500 },
    );
  }
}
