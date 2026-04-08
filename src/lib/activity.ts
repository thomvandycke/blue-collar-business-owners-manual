import { type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ActivityInput = {
  accountId: string;
  userId?: string | null;
  systemId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  metadata?: Prisma.InputJsonValue;
};

export async function logActivity(input: ActivityInput) {
  return prisma.activityLog.create({
    data: {
      accountId: input.accountId,
      userId: input.userId ?? null,
      systemId: input.systemId ?? null,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      action: input.action,
      metadataJson: input.metadata ?? undefined,
    },
  });
}
