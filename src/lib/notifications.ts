import "server-only";

import { UserRole } from "@prisma/client";
import nodemailer from "nodemailer";

const DEFAULT_NOTIFICATION_RECIPIENTS = ["thom@unmatchedgrowth.com", "brad@unmatchedgrowth.com"];
const DEFAULT_EMAIL_FROM = "Blue Collar Manual";

let transporterSingleton: nodemailer.Transporter | null = null;

function parseRecipientList(rawValue: string | undefined) {
  if (!rawValue) return [];

  return rawValue
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function getNewUserNotificationRecipients() {
  const recipientsFromList = parseRecipientList(process.env.NEW_USER_NOTIFY_EMAILS);
  if (recipientsFromList.length > 0) {
    return recipientsFromList;
  }

  const recipientsFromLegacyValue = parseRecipientList(process.env.NEW_USER_NOTIFY_EMAIL);
  if (recipientsFromLegacyValue.length > 0) {
    return recipientsFromLegacyValue;
  }

  return DEFAULT_NOTIFICATION_RECIPIENTS;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getGoogleMailConfig() {
  const user = process.env.GOOGLE_EMAIL_USER ?? process.env.GMAIL_USER;
  const appPassword = process.env.GOOGLE_EMAIL_APP_PASSWORD ?? process.env.GMAIL_APP_PASSWORD;

  if (!user || !appPassword) {
    throw new Error(
      "Google email is not configured. Set GOOGLE_EMAIL_USER and GOOGLE_EMAIL_APP_PASSWORD in Vercel.",
    );
  }

  const from = process.env.GOOGLE_EMAIL_FROM ?? `${DEFAULT_EMAIL_FROM} <${user}>`;

  return { user, appPassword, from };
}

function getTransporter() {
  if (transporterSingleton) return transporterSingleton;

  const config = getGoogleMailConfig();
  transporterSingleton = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.user,
      pass: config.appPassword,
    },
  });

  return transporterSingleton;
}

async function sendEmail(params: {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const { from } = getGoogleMailConfig();
  const transporter = getTransporter();

  await transporter.sendMail({
    from,
    to: params.to.join(", "),
    subject: params.subject,
    html: params.html,
    replyTo: params.replyTo,
  });
}

type NewUserNotificationInput = {
  accountName: string;
  email: string;
  displayName: string;
  role: UserRole;
  source: "signup" | "invite_accept" | "admin_create";
};

export async function sendNewUserNotification(input: NewUserNotificationInput) {
  const recipients = Array.from(new Set(getNewUserNotificationRecipients()));

  const sourceLabel =
    input.source === "signup"
      ? "Public Signup"
      : input.source === "invite_accept"
        ? "Invite Accepted"
        : "Created By Admin";

  const subject = `New user registered: ${input.displayName} (${input.email})`;
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">New User Registration</h2>
      <p style="margin: 0 0 12px;">A new user has been added to Blue Collar Business Owner's Manual.</p>
      <ul style="margin: 0 0 12px; padding-left: 18px;">
        <li><strong>Account:</strong> ${escapeHtml(input.accountName)}</li>
        <li><strong>Name:</strong> ${escapeHtml(input.displayName)}</li>
        <li><strong>Email:</strong> ${escapeHtml(input.email)}</li>
        <li><strong>Role:</strong> ${escapeHtml(input.role)}</li>
        <li><strong>Source:</strong> ${escapeHtml(sourceLabel)}</li>
      </ul>
      <p style="margin: 0;">Timestamp: ${new Date().toISOString()}</p>
    </div>
  `;

  await sendEmail({
    to: recipients,
    subject,
    html,
  });
}

type SupportRequestNotificationInput = {
  accountName: string;
  requesterName: string;
  requesterEmail: string;
  topic: string;
  category: "help" | "bug" | "feature";
  message: string;
};

export async function sendSupportRequestNotification(input: SupportRequestNotificationInput) {
  const recipients = ["thom@unmatchedgrowth.com", "brad@unmatchedgrowth.com"];
  const subject = `[Support:${input.category}] ${input.topic}`;
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">In-App Support Request</h2>
      <ul style="margin: 0 0 12px; padding-left: 18px;">
        <li><strong>Account:</strong> ${escapeHtml(input.accountName)}</li>
        <li><strong>Requester:</strong> ${escapeHtml(input.requesterName)}</li>
        <li><strong>Requester Email:</strong> ${escapeHtml(input.requesterEmail)}</li>
        <li><strong>Category:</strong> ${escapeHtml(input.category)}</li>
        <li><strong>Topic:</strong> ${escapeHtml(input.topic)}</li>
      </ul>
      <p style="white-space: pre-wrap; margin: 0 0 12px;"><strong>Message:</strong><br />${escapeHtml(input.message)}</p>
      <p style="margin: 0;">Timestamp: ${new Date().toISOString()}</p>
    </div>
  `;

  await sendEmail({
    to: recipients,
    subject,
    html,
    replyTo: input.requesterEmail,
  });
}
