"use server";

import { InviteStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";

import { logActivity } from "@/lib/activity";
import { getFormString } from "@/lib/form-utils";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearCurrentSession, createUserSession, requireUser } from "@/lib/auth/session";
import { sendNewUserNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { SYSTEM_DEFINITIONS } from "@/lib/system-config";
import {
  acceptInviteSchema,
  changePasswordSchema,
  loginSchema,
  requestResetSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validation";
import { toSlug } from "@/lib/utils";

export type ActionState = {
  error?: string;
  success?: string;
  resetUrl?: string;
};

async function ensureUniqueAccountSlug(name: string) {
  const baseSlug = toSlug(name);
  let candidate = baseSlug;
  let attempt = 1;

  while (true) {
    const existing = await prisma.account.findUnique({ where: { slug: candidate } });
    if (!existing) {
      return candidate;
    }

    attempt += 1;
    candidate = `${baseSlug}-${attempt}`;
  }
}

export async function signupAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    accountName: getFormString(formData, "accountName"),
    displayName: getFormString(formData, "displayName"),
    email: getFormString(formData, "email").toLowerCase(),
    password: getFormString(formData, "password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid signup details." };
  }

  const { accountName, displayName, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const slug = await ensureUniqueAccountSlug(accountName);

  const { user, account } = await prisma.$transaction(async (tx) => {
    const account = await tx.account.create({
      data: {
        name: accountName,
        slug,
        maxUsers: 3,
      },
    });

    const user = await tx.user.create({
      data: {
        accountId: account.id,
        email,
        passwordHash,
        displayName,
        role: UserRole.ADMIN,
      },
    });

    await tx.businessSystem.createMany({
      data: SYSTEM_DEFINITIONS.map((system, index) => ({
        accountId: account.id,
        name: system.name,
        sortOrder: index,
        ownerUserId: user.id,
      })),
    });

    const systems = await tx.businessSystem.findMany({
      where: { accountId: account.id },
      select: { id: true },
    });

    await tx.systemContent.createMany({
      data: systems.map((system) => ({
        systemId: system.id,
      })),
    });

    await tx.activityLog.create({
      data: {
        accountId: account.id,
        userId: user.id,
        entityType: "Account",
        entityId: account.id,
        action: "account_created",
      },
    });

    return { account, user };
  });

  await createUserSession(user.id);
  try {
    await sendNewUserNotification({
      accountName: account.name,
      email,
      displayName,
      role: user.role,
      source: "signup",
    });
  } catch (error) {
    console.error("Failed to send new user signup notification email", error);
  }
  await logActivity({
    accountId: account.id,
    userId: user.id,
    entityType: "User",
    entityId: user.id,
    action: "signup_completed",
  });

  redirect("/dashboard");
}

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: getFormString(formData, "email").toLowerCase(),
    password: getFormString(formData, "password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid login details." };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { account: true },
  });

  if (!user || !user.isActive) {
    return { error: "Invalid email or password." };
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return { error: "Invalid email or password." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createUserSession(user.id);
  await logActivity({
    accountId: user.accountId,
    userId: user.id,
    entityType: "User",
    entityId: user.id,
    action: "login",
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  const authContext = await requireUser();
  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    entityType: "Session",
    action: "logout",
  });
  await clearCurrentSession();
  redirect("/login");
}

export async function acceptInviteAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = acceptInviteSchema.safeParse({
    token: getFormString(formData, "token"),
    displayName: getFormString(formData, "displayName"),
    password: getFormString(formData, "password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid invite details." };
  }

  const { token, displayName, password } = parsed.data;

  const invite = await prisma.userInvite.findUnique({
    where: { token },
    include: { account: true },
  });

  if (!invite || invite.status !== InviteStatus.PENDING) {
    return { error: "This invite is no longer valid." };
  }

  if (invite.expiresAt < new Date()) {
    await prisma.userInvite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.EXPIRED },
    });
    return { error: "This invite has expired." };
  }

  const existingCount = await prisma.user.count({
    where: {
      accountId: invite.accountId,
      isActive: true,
    },
  });

  if (existingCount >= invite.account.maxUsers) {
    return { error: "This account is already at the 3-user limit." };
  }

  const emailInUse = await prisma.user.findUnique({ where: { email: invite.email } });
  if (emailInUse) {
    return { error: "That email already has an account." };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        accountId: invite.accountId,
        email: invite.email,
        passwordHash,
        displayName,
        role: invite.role,
      },
    });

    await tx.userInvite.update({
      where: { id: invite.id },
      data: {
        status: InviteStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });

    await tx.activityLog.create({
      data: {
        accountId: invite.accountId,
        userId: createdUser.id,
        entityType: "Invite",
        entityId: invite.id,
        action: "invite_accepted",
      },
    });

    return createdUser;
  });

  try {
    await sendNewUserNotification({
      accountName: invite.account.name,
      email: invite.email,
      displayName,
      role: invite.role,
      source: "invite_accept",
    });
  } catch (error) {
    console.error("Failed to send new user invite-accept notification email", error);
  }

  await createUserSession(user.id);
  redirect("/dashboard");
}

export async function changePasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const authContext = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: getFormString(formData, "currentPassword"),
    newPassword: getFormString(formData, "newPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password details." };
  }

  const validCurrent = await verifyPassword(parsed.data.currentPassword, authContext.user.passwordHash);
  if (!validCurrent) {
    return { error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  await prisma.user.update({
    where: { id: authContext.user.id },
    data: { passwordHash },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    entityType: "User",
    entityId: authContext.user.id,
    action: "password_changed",
  });

  revalidatePath("/settings/profile");

  return { success: "Password updated." };
}

export async function requestPasswordResetAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = requestResetSchema.safeParse({
    email: getFormString(formData, "email").toLowerCase(),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (!user) {
    return { success: "If that email exists, a reset link has been generated." };
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  await logActivity({
    accountId: user.accountId,
    userId: user.id,
    entityType: "PasswordReset",
    action: "reset_requested",
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password/${token}`;

  return {
    success: "Reset link generated. In production this should be emailed.",
    resetUrl,
  };
}

export async function resetPasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: getFormString(formData, "token"),
    password: getFormString(formData, "password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid reset request." };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "Reset link is invalid or expired." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    await tx.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    await tx.session.deleteMany({ where: { userId: resetToken.userId } });
  });

  return { success: "Password has been reset. You can now log in." };
}
