import { z } from "zod";

export const contactSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .refine(
      (value) => !/[\u0000-\u001f\u007f]/.test(value),
      "Name contains unsupported characters.",
    )
    .min(2, "Please enter your name.")
    .max(80, "Name is too long."),
  email: z
    .email("Please enter a valid email address.")
    .max(160, "Email is too long."),
  company: z.string().trim().max(120, "Company is too long.").default(""),
  message: z
    .string()
    .trim()
    .min(24, "Please share a little more detail.")
    .max(2000, "Message is too long."),
  website: z.string().trim().max(200).default(""),
});

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
