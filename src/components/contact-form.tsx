"use client";

import { ArrowRight, CircleCheck } from "lucide-react";
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
import { cn } from "@/lib/utils";

const labelClass =
  "font-mono text-[0.68rem] tracking-[0.12em] uppercase text-muted-foreground group-data-[invalid=true]/field:text-destructive";

const controlClass =
  "rounded-lg bg-background/70 px-3.5 text-[0.95rem] placeholder:text-muted-foreground/70 md:text-sm dark:bg-background/50";

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

  // Decorative request-line readout; the live regions below do the announcing.
  const requestState = isSubmitting
    ? "sending"
    : submissionState.status === "success"
      ? "sent"
      : submissionState.status === "error"
        ? "failed"
        : "ready";

  return (
    <form
      className="overflow-hidden rounded-2xl border border-border bg-card/60 shadow-[0_28px_56px_-36px_oklch(0.2_0.02_40/0.3)]"
      onSubmit={handleSubmit}
    >
      <div
        aria-hidden="true"
        className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 font-mono text-[0.7rem] text-muted-foreground sm:px-7"
      >
        <span>
          <span className="text-primary">POST</span> /api/contact
        </span>
        <span className="flex items-center gap-1.5 tracking-[0.12em] uppercase">
          <span
            className={cn(
              "size-1.5 rounded-full",
              requestState === "ready" && "bg-muted-foreground/50",
              requestState === "sending" &&
                "bg-primary motion-safe:animate-pulse",
              requestState === "sent" &&
                "bg-primary shadow-[0_0_8px_var(--glow-strong)]",
              requestState === "failed" && "bg-destructive",
            )}
          />
          {requestState}
        </span>
      </div>

      <div className="flex flex-col gap-7 p-5 sm:p-7">
        <FieldGroup>
          <div className="grid gap-5 md:grid-cols-2">
            <Field data-invalid={fieldErrors.name?.length ? true : undefined}>
              <FieldLabel htmlFor="name" className={labelClass}>
                Name
              </FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name…"
                  aria-invalid={fieldErrors.name?.length ? true : undefined}
                  className={cn(controlClass, "h-11")}
                />
                <FieldError
                  errors={fieldErrors.name?.map((message) => ({ message }))}
                />
              </FieldContent>
            </Field>

            <Field data-invalid={fieldErrors.email?.length ? true : undefined}>
              <FieldLabel htmlFor="email" className={labelClass}>
                Email
              </FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  spellCheck={false}
                  aria-invalid={fieldErrors.email?.length ? true : undefined}
                  className={cn(controlClass, "h-11")}
                />
                <FieldError
                  errors={fieldErrors.email?.map((message) => ({ message }))}
                />
              </FieldContent>
            </Field>
          </div>

          <Field data-invalid={fieldErrors.company?.length ? true : undefined}>
            <FieldLabel htmlFor="company" className={labelClass}>
              Company
            </FieldLabel>
            <FieldContent>
              <Input
                id="company"
                name="company"
                autoComplete="organization"
                aria-invalid={fieldErrors.company?.length ? true : undefined}
                className={cn(controlClass, "h-11")}
              />
              <FieldDescription className="mt-1.5 text-[0.8rem]">
                Optional context if you are hiring for a specific team or role.
              </FieldDescription>
              <FieldError
                errors={fieldErrors.company?.map((message) => ({ message }))}
              />
            </FieldContent>
          </Field>

          <Field data-invalid={fieldErrors.message?.length ? true : undefined}>
            <FieldLabel htmlFor="message" className={labelClass}>
              Message
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="message"
                name="message"
                rows={6}
                placeholder="What are you hiring for, and where do you need help?…"
                aria-invalid={fieldErrors.message?.length ? true : undefined}
                className={cn(controlClass, "min-h-36 py-3 leading-6")}
              />
              <FieldDescription className="mt-1.5 text-[0.8rem]">
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
            className="flex flex-col gap-5 rounded-xl border border-primary/25 bg-primary/[0.06] p-5"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <CircleCheck
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-lg font-medium tracking-[-0.03em] text-foreground">
                  Message sent
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {submissionState.message}
                </p>
              </div>
            </div>
            <div>
              <Button
                type="button"
                variant="subtle"
                size="lg"
                className="rounded-full px-5"
                onClick={resetSuccessState}
              >
                Send another message
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:gap-5">
            <Button
              type="submit"
              variant="brand"
              size="lg"
              disabled={isSubmitting}
              className="h-11 shrink-0 rounded-full px-6 text-[0.95rem]"
            >
              {isSubmitting ? "Sending…" : "Send message"}
              {isSubmitting ? null : (
                <ArrowRight
                  data-icon="inline-end"
                  aria-hidden="true"
                  className="motion-safe:transition-transform group-hover/button:translate-x-0.5"
                />
              )}
            </Button>
            {submissionState.status === "error" ? (
              <p
                className="max-w-sm text-sm leading-6 text-destructive"
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
      </div>
    </form>
  );
}
