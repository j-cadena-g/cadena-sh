import { describe, expect, it } from "vitest";
import { z } from "zod";

import { contactSubmissionSchema } from "./contact";

describe("contactSubmissionSchema", () => {
  it("accepts a valid submission", () => {
    const result = contactSubmissionSchema.safeParse({
      name: "James Cadena",
      email: "james@example.com",
      company: "Acme",
      message:
        "I would like to talk about a security-focused infrastructure role.",
      website: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects malformed submissions", () => {
    const result = contactSubmissionSchema.safeParse({
      name: "J",
      email: "not-an-email",
      company: "",
      message: "too short",
      website: "",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected invalid contact payload");
    }

    expect(z.flattenError(result.error).fieldErrors).toMatchObject({
      name: expect.any(Array),
      email: expect.any(Array),
      message: expect.any(Array),
    });
  });

  it("rejects control characters in the name field", () => {
    const result = contactSubmissionSchema.safeParse({
      name: "James\nCadena",
      email: "james@example.com",
      company: "Acme",
      message:
        "I would like to talk about a security-focused infrastructure role.",
      website: "",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error("Expected invalid contact payload");
    }

    expect(z.flattenError(result.error).fieldErrors).toMatchObject({
      name: expect.arrayContaining([
        expect.stringMatching(/unsupported characters/i),
      ]),
    });
  });
});
