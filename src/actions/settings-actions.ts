"use server";

import { InviteStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";

import type { ActionState } from "@/actions/auth-actions";
import { logActivity } from "@/lib/activity";
import { getFormString } from "@/lib/form-utils";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { accountBrandingSchema, inviteSchema, profileSchema } from "@/lib/validation";

export async function updateAccountBrandingAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authContext = await requireAdmin();

  const parsed = accountBrandingSchema.safeParse({
    name: getFormString(formData, "name"),
    primaryColor: getFormString(formData, "primaryColor"),
    logoUrl: getFormString(formData, "logoUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid account settings." };
  }

  const { name, primaryColor, logoUrl } = parsed.data;

  await prisma.account.update({
    where: { id: authContext.account.id },
    data: {
      name,
      primaryColor: primaryColor || null,
      logoUrl: logoUrl || null,
    },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    entityType: "Account",
    entityId: authContext.account.id,
    action: "branding_updated",
  });

  revalidatePath("/settings/account");
  revalidatePath("/dashboard");

  return { success: "Account branding updated." };
}

export async function updateProfileAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const authContext = await requireUser();

  const parsed = profileSchema.safeParse({
    displayName: getFormString(formData, "displayName"),
    profileImageUrl: getFormString(formData, "profileImageUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile settings." };
  }

  await prisma.user.update({
    where: { id: authContext.user.id },
    data: {
      displayName: parsed.data.displayName,
      profileImageUrl: parsed.data.profileImageUrl || null,
    },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    entityType: "User",
    entityId: authContext.user.id,
    action: "profile_updated",
  });

  revalidatePath("/settings/profile");
  revalidatePath("/dashboard");

  return { success: "Profile updated." };
}

export async function inviteUserAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const authContext = await requireAdmin();

  const parsed = inviteSchema.safeParse({
    email: getFormString(formData, "email").toLowerCase(),
    role: getFormString(formData, "role") as UserRole,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid invite details." };
  }

  const { email, role } = parsed.data;

  const [activeUsers, pendingInvites] = await Promise.all([
    prisma.user.count({
      where: {
        accountId: authContext.account.id,
        isActive: true,
      },
    }),
    prisma.userInvite.count({
      where: {
        accountId: authContext.account.id,
        status: InviteStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
    }),
  ]);

  if (activeUsers + pendingInvites >= authContext.account.maxUsers) {
    return {
      error: `This account is capped at ${authContext.account.maxUsers} users on the base plan.`,
    };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "That email is already in use." };
  }

  const existingInvite = await prisma.userInvite.findFirst({
    where: {
      accountId: authContext.account.id,
      email,
      status: InviteStatus.PENDING,
      expiresAt: { gt: new Date() },
    },
  });

  if (existingInvite) {
    const existingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/accept-invite/${existingInvite.token}`;
    return {
      success: "Invite already exists. Re-share the existing link below.",
      resetUrl: existingUrl,
    };
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  const invite = await prisma.userInvite.create({
    data: {
      accountId: authContext.account.id,
      email,
      role,
      token,
      expiresAt,
      invitedByUserId: authContext.user.id,
    },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    entityType: "Invite",
    entityId: invite.id,
    action: "invite_created",
    metadata: { email, role },
  });

  revalidatePath("/settings/users");

  return {
    success: "Invite created. Share this secure link:",
    resetUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/accept-invite/${token}`,
  };
}

export async function cancelInviteAction(formData: FormData): Promise<void> {
  const authContext = await requireAdmin();
  const inviteId = getFormString(formData, "inviteId");

  if (!inviteId) return;

  const invite = await prisma.userInvite.findFirst({
    where: {
      id: inviteId,
      accountId: authContext.account.id,
      status: InviteStatus.PENDING,
    },
  });

  if (!invite) return;

  await prisma.userInvite.update({
    where: { id: inviteId },
    data: { status: InviteStatus.CANCELED },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    entityType: "Invite",
    entityId: invite.id,
    action: "invite_canceled",
  });

  revalidatePath("/settings/users");
}

export async function toggleUserActiveAction(formData: FormData): Promise<void> {
  const authContext = await requireAdmin();

  const userId = getFormString(formData, "userId");
  const setActive = getFormString(formData, "setActive") === "true";

  if (!userId || userId === authContext.user.id) {
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      accountId: authContext.account.id,
    },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: setActive },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    entityType: "User",
    entityId: user.id,
    action: setActive ? "user_reactivated" : "user_deactivated",
  });

  revalidatePath("/settings/users");
  revalidatePath("/dashboard");
}
