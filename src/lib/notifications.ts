import "server-only";

import { UserRole } from "@prisma/client";

type NewUserNotificationInput = {
  accountName: string;
  email: string;
  displayName: string;
  role: UserRole;
  source: "signup" | "invite_accept" | "admin_create";
};

export async function sendNewUserNotification(input: NewUserNotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.NEW_USER_NOTIFY_EMAIL ?? "thom@unmatchedgrowth.com";
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Blue Collar Manual <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not configured. Skipping new user notification email.");
    return;
  }

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
        <li><strong>Account:</strong> ${input.accountName}</li>
        <li><strong>Name:</strong> ${input.displayName}</li>
        <li><strong>Email:</strong> ${input.email}</li>
        <li><strong>Role:</strong> ${input.role}</li>
        <li><strong>Source:</strong> ${sourceLabel}</li>
      </ul>
      <p style="margin: 0;">Timestamp: ${new Date().toISOString()}</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend email failed (${response.status}): ${body}`);
  }
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
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Blue Collar Manual <onboarding@resend.dev>";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const recipients = ["thom@unmatchedgrowth.com", "brad@unmatchedgrowth.com"];
  const subject = `[Support:${input.category}] ${input.topic}`;
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">In-App Support Request</h2>
      <ul style="margin: 0 0 12px; padding-left: 18px;">
        <li><strong>Account:</strong> ${input.accountName}</li>
        <li><strong>Requester:</strong> ${input.requesterName}</li>
        <li><strong>Requester Email:</strong> ${input.requesterEmail}</li>
        <li><strong>Category:</strong> ${input.category}</li>
        <li><strong>Topic:</strong> ${input.topic}</li>
      </ul>
      <p style="white-space: pre-wrap; margin: 0 0 12px;"><strong>Message:</strong><br />${input.message}</p>
      <p style="margin: 0;">Timestamp: ${new Date().toISOString()}</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipients,
      subject,
      html,
      reply_to: input.requesterEmail,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Support email failed (${response.status}): ${body}`);
  }
}
