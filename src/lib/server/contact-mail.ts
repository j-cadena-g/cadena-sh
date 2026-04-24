import "server-only";

import { Resend } from "resend";

import type { ContactSubmission } from "@/lib/contact";
import { getContactMailConfig } from "@/lib/server/contact-config";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildFromAddress(fromName: string, fromEmail: string) {
  return `${fromName} <${fromEmail}>`;
}

function sanitizeMailHeaderValue(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

function buildMessageBody(submission: ContactSubmission) {
  const companyLine = submission.company
    ? `Company: ${submission.company}\n`
    : "";

  return [
    "New message from cadena.sh",
    "",
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    companyLine.trimEnd(),
    "",
    "Message:",
    submission.message,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildMessageHtml(submission: ContactSubmission) {
  const companyBlock = submission.company
    ? `<p><strong>Company:</strong> ${escapeHtml(submission.company)}</p>`
    : "";

  return [
    "<div>",
    "<p><strong>New message from cadena.sh</strong></p>",
    `<p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>`,
    companyBlock,
    `<p><strong>Message:</strong></p><p>${escapeHtml(submission.message).replaceAll("\n", "<br />")}</p>`,
    "</div>",
  ]
    .filter(Boolean)
    .join("");
}

export async function sendContactEmail(submission: ContactSubmission) {
  const config = await getContactMailConfig();
  const resend = new Resend(config.resendApiKey);

  const { error } = await resend.emails.send({
    from: buildFromAddress(config.resendFromName, config.resendFromEmail),
    to: [config.contactEmailTo],
    subject: `cadena.sh contact: ${sanitizeMailHeaderValue(submission.name)}`,
    replyTo: submission.email,
    text: buildMessageBody(submission),
    html: buildMessageHtml(submission),
  });

  if (error) {
    throw new Error("Resend request failed", { cause: error });
  }
}
