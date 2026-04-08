"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/actions/auth-actions";
import { logActivity } from "@/lib/activity";
import { getFormString } from "@/lib/form-utils";
import { requireUser } from "@/lib/auth/session";
import { sendSupportRequestNotification } from "@/lib/notifications";
import { supportRequestSchema } from "@/lib/validation";

export async function submitSupportRequestAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authContext = await requireUser();

  const parsed = supportRequestSchema.safeParse({
    topic: getFormString(formData, "topic"),
    category: getFormString(formData, "category"),
    message: getFormString(formData, "message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please complete all required support fields." };
  }

  try {
    await sendSupportRequestNotification({
      accountName: authContext.account.name,
      requesterName: authContext.user.displayName,
      requesterEmail: authContext.user.email,
      topic: parsed.data.topic,
      category: parsed.data.category,
      message: parsed.data.message,
    });
  } catch (error) {
    console.error("Failed to send support request email", error);
    return { error: "We could not send your request right now. Please try again in a moment." };
  }

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    entityType: "Support",
    action: "support_request_submitted",
    metadata: { category: parsed.data.category, topic: parsed.data.topic },
  });

  revalidatePath("/support");

  return { success: "Thanks — your request was sent to the team." };
}

