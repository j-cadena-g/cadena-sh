"use client";

import { useState } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type FieldErrors = Partial<
  Record<"name" | "email" | "company" | "message", string[]>
>;

type SubmissionState =
  | {
      status: "idle";
      message: string;
    }
  | {
      status: "success" | "error";
      message: string;
    };

const initialState: SubmissionState = {
  status: "idle",
  message: "",
};

export function ContactForm() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setFieldErrors({});
    setSubmissionState(initialState);
    setIsSubmitting(true);

    void submitForm(form, formData).finally(() => {
      setIsSubmitting(false);
    });
  }

  async function submitForm(form: HTMLFormElement, formData: FormData) {
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      message: String(formData.get("message") ?? ""),
      website: String(formData.get("website") ?? ""),
    };

    let response: Response;

    try {
      response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch {
      setSubmissionState({
        status: "error",
        message: "Network error. Please check your connection and try again.",
      });
      return;
    }

    let result:
      | {
          ok: boolean;
          message?: string;
          fieldErrors?: FieldErrors;
        }
      | undefined;

    try {
      result = (await response.json()) as {
        ok: boolean;
        message?: string;
        fieldErrors?: FieldErrors;
      };
    } catch {
      result = undefined;
    }

    if (!response.ok) {
      setFieldErrors(result?.fieldErrors ?? {});
      setSubmissionState({
        status: "error",
        message: result?.message ?? "Unable to send your message right now.",
      });
      return;
    }

    form.reset();
    setFieldErrors({});
    setSubmissionState({
      status: "success",
      message: "Message sent. I will follow up when I can.",
    });
  }

  function resetSuccessState() {
    setSubmissionState(initialState);
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Field data-invalid={fieldErrors.name?.length ? true : undefined}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <FieldContent>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Your name…"
                aria-invalid={fieldErrors.name?.length ? true : undefined}
              />
              <FieldError
                errors={fieldErrors.name?.map((message) => ({ message }))}
              />
            </FieldContent>
          </Field>

          <Field data-invalid={fieldErrors.email?.length ? true : undefined}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                spellCheck={false}
                aria-invalid={fieldErrors.email?.length ? true : undefined}
              />
              <FieldError
                errors={fieldErrors.email?.map((message) => ({ message }))}
              />
            </FieldContent>
          </Field>
        </div>

        <Field data-invalid={fieldErrors.company?.length ? true : undefined}>
          <FieldLabel htmlFor="company">Company</FieldLabel>
          <FieldContent>
            <Input
              id="company"
              name="company"
              autoComplete="organization"
              aria-invalid={fieldErrors.company?.length ? true : undefined}
            />
            <FieldDescription>
              Optional context if you are hiring for a specific team or role.
            </FieldDescription>
            <FieldError
              errors={fieldErrors.company?.map((message) => ({ message }))}
            />
          </FieldContent>
        </Field>

        <Field data-invalid={fieldErrors.message?.length ? true : undefined}>
          <FieldLabel htmlFor="message">Message</FieldLabel>
          <FieldContent>
            <Textarea
              id="message"
              name="message"
              rows={6}
              placeholder="What are you hiring for, and where do you need help?…"
              aria-invalid={fieldErrors.message?.length ? true : undefined}
            />
            <FieldDescription>
              A little context helps me reply usefully.
            </FieldDescription>
            <FieldError
              errors={fieldErrors.message?.map((message) => ({ message }))}
            />
          </FieldContent>
        </Field>

        <Field className="sr-only">
          <FieldLabel htmlFor="website">Website</FieldLabel>
          <FieldContent>
            <Input
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </FieldContent>
        </Field>
      </FieldGroup>

      {submissionState.status === "success" ? (
        <div
          className="flex flex-col gap-4 border-t border-border/70 pt-5"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-lg tracking-[-0.04em] text-foreground">
                Message sent
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {submissionState.message}
              </p>
            </div>
            <span className="w-fit rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[0.7rem] font-medium tracking-[0.18em] uppercase text-primary">
              Success
            </span>
          </div>
          <div>
            <Button type="button" variant="subtle" onClick={resetSuccessState}>
              Send another message
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
          <Button
            type="submit"
            variant="brand"
            size="lg"
            disabled={isSubmitting}
            className="shrink-0 rounded-full px-5"
          >
            {isSubmitting ? "Sending…" : "Send message"}
          </Button>
          {submissionState.status === "error" ? (
            <p
              className="max-w-sm text-sm leading-6 text-muted-foreground"
              role="alert"
            >
              {submissionState.message}
            </p>
          ) : (
            <p
              className="max-w-sm text-sm leading-6 text-muted-foreground"
              role="status"
            >
              {submissionState.message}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
