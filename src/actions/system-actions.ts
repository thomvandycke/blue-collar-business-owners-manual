"use server";

import { ItemStatus, KPIType, PriorityLevel, UpdateFrequency, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

import type { ActionState } from "@/actions/auth-actions";
import { logActivity } from "@/lib/activity";
import { getFormBoolean, getFormOptionalString, getFormString, parseOptionalDate } from "@/lib/form-utils";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  annualGoalSchema,
  kpiCreateSchema,
  kpiUpdateSchema,
  priorityItemSchema,
  quarterlyMilestoneSchema,
  systemContentSchema,
  taskSchema,
} from "@/lib/validation";
import { getSystemByName } from "@/lib/system-config";

const SYSTEM_PATH_FALLBACK = "/dashboard";

async function getSystemPath(systemId: string) {
  const system = await prisma.businessSystem.findUnique({
    where: { id: systemId },
    select: { name: true },
  });

  if (!system) return SYSTEM_PATH_FALLBACK;

  const definition = getSystemByName(system.name);
  if (!definition) return SYSTEM_PATH_FALLBACK;

  return `/systems/${definition.slug}`;
}

async function revalidateSystem(systemId: string) {
  const path = await getSystemPath(systemId);
  revalidatePath(path);
  revalidatePath(`${path}/summary`);
  revalidatePath("/dashboard");
}

async function assertSystemAdminAccess(systemId: string, accountId: string) {
  const system = await prisma.businessSystem.findFirst({
    where: {
      id: systemId,
      accountId,
    },
  });

  if (!system) {
    throw new Error("System not found.");
  }

  return system;
}

async function normalizeOwnerId(accountId: string, ownerUserId?: string) {
  if (!ownerUserId) return null;

  const owner = await prisma.user.findFirst({
    where: {
      id: ownerUserId,
      accountId,
      isActive: true,
    },
    select: { id: true },
  });

  return owner?.id ?? null;
}

function toNumberOrUndefined(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}

export async function updateSystemOwnerAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authContext = await requireAdmin();
  const systemId = getFormString(formData, "systemId");
  const ownerUserId = getFormOptionalString(formData, "ownerUserId");

  if (!systemId) {
    return { error: "System is required." };
  }

  await assertSystemAdminAccess(systemId, authContext.account.id);

  const normalizedOwnerId = await normalizeOwnerId(authContext.account.id, ownerUserId);

  await prisma.businessSystem.update({
    where: { id: systemId },
    data: { ownerUserId: normalizedOwnerId },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId,
    entityType: "BusinessSystem",
    entityId: systemId,
    action: "system_owner_updated",
    metadata: { ownerUserId: normalizedOwnerId },
  });

  await revalidateSystem(systemId);

  return { success: "System owner updated." };
}

export async function updateSystemContentAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const authContext = await requireAdmin();

  const payload = {
    systemId: getFormString(formData, "systemId"),
    gamePlanObjective: getFormOptionalString(formData, "gamePlanObjective"),
    gamePlanSuccessDefinition: getFormOptionalString(formData, "gamePlanSuccessDefinition"),
    gamePlanFocus: getFormOptionalString(formData, "gamePlanFocus"),
    gamePlanNotFocus: getFormOptionalString(formData, "gamePlanNotFocus"),
    riggingBuildNeeds: getFormOptionalString(formData, "riggingBuildNeeds"),
    riggingToolsProcesses: getFormOptionalString(formData, "riggingToolsProcesses"),
    riggingOwnershipNotes: getFormOptionalString(formData, "riggingOwnershipNotes"),
    tractionWeeklyActions: getFormOptionalString(formData, "tractionWeeklyActions"),
    tractionPrioritiesSummary: getFormOptionalString(formData, "tractionPrioritiesSummary"),
    tractionNextSteps: getFormOptionalString(formData, "tractionNextSteps"),
  };

  const parsed = systemContentSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid GRIT content." };
  }

  const { systemId, ...contentData } = parsed.data;
  const system = await assertSystemAdminAccess(systemId, authContext.account.id);

  await prisma.systemContent.upsert({
    where: { systemId: system.id },
    create: {
      systemId: system.id,
      ...contentData,
    },
    update: {
      ...contentData,
    },
  });

  const completeFlag = getFormBoolean(formData, "isCompleted");
  await prisma.businessSystem.update({
    where: { id: system.id },
    data: { isCompleted: completeFlag },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId: system.id,
    entityType: "SystemContent",
    entityId: system.id,
    action: "grit_content_updated",
  });

  await revalidateSystem(system.id);

  return { success: "System content saved." };
}

export async function createKpiAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const authContext = await requireAdmin();

  const payload = {
    systemId: getFormString(formData, "systemId"),
    ownerUserId: getFormOptionalString(formData, "ownerUserId") ?? "",
    name: getFormString(formData, "name"),
    description: getFormOptionalString(formData, "description"),
    type: getFormString(formData, "type") as KPIType,
    targetValue: toNumberOrUndefined(getFormOptionalString(formData, "targetValue")),
    currentValue: toNumberOrUndefined(getFormOptionalString(formData, "currentValue")),
    unit: getFormOptionalString(formData, "unit"),
    updateFrequency: (getFormOptionalString(formData, "updateFrequency") as UpdateFrequency | undefined) ??
      undefined,
    isActive: getFormBoolean(formData, "isActive"),
  };

  const parsed = kpiCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid KPI." };
  }

  const system = await assertSystemAdminAccess(parsed.data.systemId, authContext.account.id);

  if (parsed.data.isActive) {
    const activeKpiCount = await prisma.kPI.count({
      where: {
        systemId: system.id,
        isActive: true,
      },
    });

    if (activeKpiCount >= 5) {
      return { error: "Each system can have up to 5 active KPIs." };
    }
  }

  const ownerUserId = await normalizeOwnerId(authContext.account.id, parsed.data.ownerUserId || undefined);

  const latest = await prisma.kPI.findFirst({
    where: { systemId: system.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const kpi = await prisma.kPI.create({
    data: {
      systemId: system.id,
      ownerUserId,
      name: parsed.data.name,
      description: parsed.data.description,
      type: parsed.data.type,
      targetValue: parsed.data.targetValue,
      currentValue: parsed.data.currentValue,
      unit: parsed.data.unit,
      updateFrequency: parsed.data.updateFrequency,
      isActive: parsed.data.isActive,
      sortOrder: (latest?.sortOrder ?? -1) + 1,
    },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId: system.id,
    entityType: "KPI",
    entityId: kpi.id,
    action: "kpi_created",
  });

  await revalidateSystem(system.id);

  return { success: "KPI created." };
}

export async function updateKpiAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const authContext = await requireAdmin();

  const payload = {
    id: getFormString(formData, "id"),
    systemId: getFormString(formData, "systemId"),
    ownerUserId: getFormOptionalString(formData, "ownerUserId") ?? "",
    name: getFormString(formData, "name"),
    description: getFormOptionalString(formData, "description"),
    type: getFormString(formData, "type") as KPIType,
    targetValue: toNumberOrUndefined(getFormOptionalString(formData, "targetValue")),
    currentValue: toNumberOrUndefined(getFormOptionalString(formData, "currentValue")),
    unit: getFormOptionalString(formData, "unit"),
    updateFrequency: (getFormOptionalString(formData, "updateFrequency") as UpdateFrequency | undefined) ??
      undefined,
    isActive: getFormBoolean(formData, "isActive"),
  };

  const parsed = kpiUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid KPI." };
  }

  const kpi = await prisma.kPI.findFirst({
    where: {
      id: parsed.data.id,
      systemId: parsed.data.systemId,
      system: { accountId: authContext.account.id },
    },
  });

  if (!kpi) {
    return { error: "KPI not found." };
  }

  if (!kpi.isActive && parsed.data.isActive) {
    const activeKpiCount = await prisma.kPI.count({
      where: {
        systemId: kpi.systemId,
        isActive: true,
      },
    });

    if (activeKpiCount >= 5) {
      return { error: "Each system can have up to 5 active KPIs." };
    }
  }

  const ownerUserId = await normalizeOwnerId(authContext.account.id, parsed.data.ownerUserId || undefined);

  await prisma.kPI.update({
    where: { id: kpi.id },
    data: {
      ownerUserId,
      name: parsed.data.name,
      description: parsed.data.description,
      type: parsed.data.type,
      targetValue: parsed.data.targetValue,
      currentValue: parsed.data.currentValue,
      unit: parsed.data.unit,
      updateFrequency: parsed.data.updateFrequency,
      isActive: parsed.data.isActive,
    },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId: kpi.systemId,
    entityType: "KPI",
    entityId: kpi.id,
    action: "kpi_updated",
  });

  await revalidateSystem(kpi.systemId);

  return { success: "KPI updated." };
}

export async function deleteKpiAction(formData: FormData): Promise<void> {
  const authContext = await requireAdmin();
  const id = getFormString(formData, "id");
  const systemId = getFormString(formData, "systemId");

  if (!id || !systemId) return;

  const kpi = await prisma.kPI.findFirst({
    where: {
      id,
      systemId,
      system: { accountId: authContext.account.id },
    },
  });

  if (!kpi) return;

  await prisma.kPI.delete({ where: { id: kpi.id } });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId,
    entityType: "KPI",
    entityId: id,
    action: "kpi_deleted",
  });

  await revalidateSystem(systemId);
}

export async function createAnnualGoalAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const authContext = await requireAdmin();

  const payload = {
    systemId: getFormString(formData, "systemId"),
    ownerUserId: getFormOptionalString(formData, "ownerUserId") ?? "",
    title: getFormString(formData, "title"),
    description: getFormOptionalString(formData, "description"),
    status: (getFormString(formData, "status") as ItemStatus) || ItemStatus.NOT_STARTED,
    priority: (getFormString(formData, "priority") as PriorityLevel) || PriorityLevel.MEDIUM,
    dueDate: getFormOptionalString(formData, "dueDate"),
    notes: getFormOptionalString(formData, "notes"),
  };

  const parsed = annualGoalSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid annual goal." };
  }

  const system = await assertSystemAdminAccess(parsed.data.systemId, authContext.account.id);
  const ownerUserId = await normalizeOwnerId(authContext.account.id, parsed.data.ownerUserId || undefined);

  const latest = await prisma.annualGoal.findFirst({
    where: { systemId: system.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const goal = await prisma.annualGoal.create({
    data: {
      systemId: system.id,
      ownerUserId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parseOptionalDate(parsed.data.dueDate),
      notes: parsed.data.notes,
      sortOrder: (latest?.sortOrder ?? -1) + 1,
    },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId: system.id,
    entityType: "AnnualGoal",
    entityId: goal.id,
    action: "annual_goal_created",
  });

  await revalidateSystem(system.id);

  return { success: "Annual goal created." };
}

export async function updateAnnualGoalAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const authContext = await requireAdmin();

  const id = getFormString(formData, "id");
  const payload = {
    systemId: getFormString(formData, "systemId"),
    ownerUserId: getFormOptionalString(formData, "ownerUserId") ?? "",
    title: getFormString(formData, "title"),
    description: getFormOptionalString(formData, "description"),
    status: getFormString(formData, "status") as ItemStatus,
    priority: getFormString(formData, "priority") as PriorityLevel,
    dueDate: getFormOptionalString(formData, "dueDate"),
    notes: getFormOptionalString(formData, "notes"),
  };

  const parsed = annualGoalSchema.safeParse(payload);
  if (!parsed.success || !id) {
    return { error: parsed.success ? "Goal id is required." : parsed.error.issues[0]?.message };
  }

  const goal = await prisma.annualGoal.findFirst({
    where: {
      id,
      systemId: parsed.data.systemId,
      system: { accountId: authContext.account.id },
    },
  });

  if (!goal) {
    return { error: "Annual goal not found." };
  }

  const ownerUserId = await normalizeOwnerId(authContext.account.id, parsed.data.ownerUserId || undefined);

  await prisma.annualGoal.update({
    where: { id: goal.id },
    data: {
      ownerUserId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parseOptionalDate(parsed.data.dueDate),
      notes: parsed.data.notes,
    },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId: goal.systemId,
    entityType: "AnnualGoal",
    entityId: goal.id,
    action: "annual_goal_updated",
  });

  await revalidateSystem(goal.systemId);

  return { success: "Annual goal updated." };
}

export async function deleteAnnualGoalAction(formData: FormData): Promise<void> {
  const authContext = await requireAdmin();
  const id = getFormString(formData, "id");
  const systemId = getFormString(formData, "systemId");
  if (!id || !systemId) return;

  const goal = await prisma.annualGoal.findFirst({
    where: {
      id,
      systemId,
      system: { accountId: authContext.account.id },
    },
  });

  if (!goal) return;

  await prisma.annualGoal.delete({ where: { id: goal.id } });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId,
    entityType: "AnnualGoal",
    entityId: id,
    action: "annual_goal_deleted",
  });

  await revalidateSystem(systemId);
}

export async function createMilestoneAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const authContext = await requireAdmin();

  const payload = {
    systemId: getFormString(formData, "systemId"),
    annualGoalId: getFormOptionalString(formData, "annualGoalId") ?? "",
    ownerUserId: getFormOptionalString(formData, "ownerUserId") ?? "",
    title: getFormString(formData, "title"),
    description: getFormOptionalString(formData, "description"),
    status: (getFormString(formData, "status") as ItemStatus) || ItemStatus.NOT_STARTED,
    priority: (getFormString(formData, "priority") as PriorityLevel) || PriorityLevel.MEDIUM,
    dueDate: getFormOptionalString(formData, "dueDate"),
    quarterLabel: getFormOptionalString(formData, "quarterLabel"),
    notes: getFormOptionalString(formData, "notes"),
  };

  const parsed = quarterlyMilestoneSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid quarterly milestone." };
  }

  const system = await assertSystemAdminAccess(parsed.data.systemId, authContext.account.id);
  const ownerUserId = await normalizeOwnerId(authContext.account.id, parsed.data.ownerUserId || undefined);

  const annualGoalId = parsed.data.annualGoalId || null;
  if (annualGoalId) {
    const goal = await prisma.annualGoal.findFirst({
      where: {
        id: annualGoalId,
        systemId: system.id,
      },
    });

    if (!goal) {
      return { error: "Selected annual goal was not found in this system." };
    }
  }

  const latest = await prisma.quarterlyMilestone.findFirst({
    where: { systemId: system.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const milestone = await prisma.quarterlyMilestone.create({
    data: {
      systemId: system.id,
      annualGoalId,
      ownerUserId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parseOptionalDate(parsed.data.dueDate),
      quarterLabel: parsed.data.quarterLabel,
      notes: parsed.data.notes,
      sortOrder: (latest?.sortOrder ?? -1) + 1,
    },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId: system.id,
    entityType: "QuarterlyMilestone",
    entityId: milestone.id,
    action: "milestone_created",
  });

  await revalidateSystem(system.id);

  return { success: "Quarterly milestone created." };
}

export async function updateMilestoneAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const authContext = await requireAdmin();
  const id = getFormString(formData, "id");

  const payload = {
    systemId: getFormString(formData, "systemId"),
    annualGoalId: getFormOptionalString(formData, "annualGoalId") ?? "",
    ownerUserId: getFormOptionalString(formData, "ownerUserId") ?? "",
    title: getFormString(formData, "title"),
    description: getFormOptionalString(formData, "description"),
    status: getFormString(formData, "status") as ItemStatus,
    priority: getFormString(formData, "priority") as PriorityLevel,
    dueDate: getFormOptionalString(formData, "dueDate"),
    quarterLabel: getFormOptionalString(formData, "quarterLabel"),
    notes: getFormOptionalString(formData, "notes"),
  };

  const parsed = quarterlyMilestoneSchema.safeParse(payload);
  if (!parsed.success || !id) {
    return { error: parsed.success ? "Milestone id is required." : parsed.error.issues[0]?.message };
  }

  const milestone = await prisma.quarterlyMilestone.findFirst({
    where: {
      id,
      systemId: parsed.data.systemId,
      system: { accountId: authContext.account.id },
    },
  });

  if (!milestone) {
    return { error: "Milestone not found." };
  }

  const ownerUserId = await normalizeOwnerId(authContext.account.id, parsed.data.ownerUserId || undefined);

  const annualGoalId = parsed.data.annualGoalId || null;
  if (annualGoalId) {
    const goal = await prisma.annualGoal.findFirst({
      where: {
        id: annualGoalId,
        systemId: milestone.systemId,
      },
    });

    if (!goal) {
      return { error: "Selected annual goal was not found in this system." };
    }
  }

  await prisma.quarterlyMilestone.update({
    where: { id: milestone.id },
    data: {
      annualGoalId,
      ownerUserId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parseOptionalDate(parsed.data.dueDate),
      quarterLabel: parsed.data.quarterLabel,
      notes: parsed.data.notes,
    },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId: milestone.systemId,
    entityType: "QuarterlyMilestone",
    entityId: milestone.id,
    action: "milestone_updated",
  });

  await revalidateSystem(milestone.systemId);

  return { success: "Quarterly milestone updated." };
}

export async function deleteMilestoneAction(formData: FormData): Promise<void> {
  const authContext = await requireAdmin();
  const id = getFormString(formData, "id");
  const systemId = getFormString(formData, "systemId");
  if (!id || !systemId) return;

  const milestone = await prisma.quarterlyMilestone.findFirst({
    where: {
      id,
      systemId,
      system: { accountId: authContext.account.id },
    },
  });

  if (!milestone) return;

  await prisma.quarterlyMilestone.delete({ where: { id: milestone.id } });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId,
    entityType: "QuarterlyMilestone",
    entityId: id,
    action: "milestone_deleted",
  });

  await revalidateSystem(systemId);
}

export async function createTaskAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const authContext = await requireAdmin();

  const payload = {
    systemId: getFormString(formData, "systemId"),
    annualGoalId: getFormOptionalString(formData, "annualGoalId") ?? "",
    quarterlyMilestoneId: getFormOptionalString(formData, "quarterlyMilestoneId") ?? "",
    ownerUserId: getFormOptionalString(formData, "ownerUserId") ?? "",
    title: getFormString(formData, "title"),
    description: getFormOptionalString(formData, "description"),
    status: (getFormString(formData, "status") as ItemStatus) || ItemStatus.NOT_STARTED,
    priority: (getFormString(formData, "priority") as PriorityLevel) || PriorityLevel.MEDIUM,
    dueDate: getFormOptionalString(formData, "dueDate"),
    notes: getFormOptionalString(formData, "notes"),
  };

  const parsed = taskSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid task." };
  }

  const system = await assertSystemAdminAccess(parsed.data.systemId, authContext.account.id);
  const ownerUserId = await normalizeOwnerId(authContext.account.id, parsed.data.ownerUserId || undefined);

  const annualGoalId = parsed.data.annualGoalId || null;
  const quarterlyMilestoneId = parsed.data.quarterlyMilestoneId || null;

  if (annualGoalId) {
    const goal = await prisma.annualGoal.findFirst({
      where: { id: annualGoalId, systemId: system.id },
    });
    if (!goal) return { error: "Selected annual goal was not found in this system." };
  }

  if (quarterlyMilestoneId) {
    const milestone = await prisma.quarterlyMilestone.findFirst({
      where: { id: quarterlyMilestoneId, systemId: system.id },
    });
    if (!milestone) return { error: "Selected milestone was not found in this system." };
  }

  const latest = await prisma.task.findFirst({
    where: { systemId: system.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const task = await prisma.task.create({
    data: {
      systemId: system.id,
      annualGoalId,
      quarterlyMilestoneId,
      ownerUserId,
      createdByUserId: authContext.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parseOptionalDate(parsed.data.dueDate),
      notes: parsed.data.notes,
      completedAt: parsed.data.status === ItemStatus.COMPLETE ? new Date() : null,
      sortOrder: (latest?.sortOrder ?? -1) + 1,
    },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId: system.id,
    entityType: "Task",
    entityId: task.id,
    action: "task_created",
  });

  await revalidateSystem(system.id);

  return { success: "Task created." };
}

export async function updateTaskAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const authContext = await requireUser();

  const id = getFormString(formData, "id");
  const systemId = getFormString(formData, "systemId");
  if (!id || !systemId) {
    return { error: "Task id is required." };
  }

  const task = await prisma.task.findFirst({
    where: {
      id,
      systemId,
      system: { accountId: authContext.account.id },
    },
  });

  if (!task) {
    return { error: "Task not found." };
  }

  const isAdmin = authContext.user.role === UserRole.ADMIN;
  const isAssignedMember = task.ownerUserId === authContext.user.id;

  if (!isAdmin && !isAssignedMember) {
    return { error: "You can only update tasks assigned to you." };
  }

  if (!isAdmin) {
    const status = (getFormString(formData, "status") as ItemStatus) || task.status;
    const notes = getFormOptionalString(formData, "notes");

    await prisma.task.update({
      where: { id: task.id },
      data: {
        status,
        notes,
        completedAt: status === ItemStatus.COMPLETE ? new Date() : null,
      },
    });

    await logActivity({
      accountId: authContext.account.id,
      userId: authContext.user.id,
      systemId,
      entityType: "Task",
      entityId: task.id,
      action: "task_status_updated",
      metadata: { status },
    });

    await revalidateSystem(systemId);
    return { success: "Task updated." };
  }

  const payload = {
    systemId,
    annualGoalId: getFormOptionalString(formData, "annualGoalId") ?? "",
    quarterlyMilestoneId: getFormOptionalString(formData, "quarterlyMilestoneId") ?? "",
    ownerUserId: getFormOptionalString(formData, "ownerUserId") ?? "",
    title: getFormString(formData, "title"),
    description: getFormOptionalString(formData, "description"),
    status: getFormString(formData, "status") as ItemStatus,
    priority: getFormString(formData, "priority") as PriorityLevel,
    dueDate: getFormOptionalString(formData, "dueDate"),
    notes: getFormOptionalString(formData, "notes"),
  };

  const parsed = taskSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid task." };
  }

  const ownerUserId = await normalizeOwnerId(authContext.account.id, parsed.data.ownerUserId || undefined);
  const annualGoalId = parsed.data.annualGoalId || null;
  const quarterlyMilestoneId = parsed.data.quarterlyMilestoneId || null;

  await prisma.task.update({
    where: { id: task.id },
    data: {
      annualGoalId,
      quarterlyMilestoneId,
      ownerUserId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parseOptionalDate(parsed.data.dueDate),
      notes: parsed.data.notes,
      completedAt: parsed.data.status === ItemStatus.COMPLETE ? new Date() : null,
    },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId,
    entityType: "Task",
    entityId: task.id,
    action: "task_updated",
  });

  await revalidateSystem(systemId);

  return { success: "Task updated." };
}

export async function deleteTaskAction(formData: FormData): Promise<void> {
  const authContext = await requireAdmin();
  const id = getFormString(formData, "id");
  const systemId = getFormString(formData, "systemId");

  if (!id || !systemId) return;

  const task = await prisma.task.findFirst({
    where: {
      id,
      systemId,
      system: { accountId: authContext.account.id },
    },
  });

  if (!task) return;

  await prisma.task.delete({ where: { id: task.id } });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId,
    entityType: "Task",
    entityId: id,
    action: "task_deleted",
  });

  await revalidateSystem(systemId);
}

export async function createPriorityAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const authContext = await requireAdmin();

  const payload = {
    systemId: getFormString(formData, "systemId"),
    ownerUserId: getFormOptionalString(formData, "ownerUserId") ?? "",
    title: getFormString(formData, "title"),
    description: getFormOptionalString(formData, "description"),
    status: (getFormString(formData, "status") as ItemStatus) || ItemStatus.NOT_STARTED,
    priority: (getFormString(formData, "priority") as PriorityLevel) || PriorityLevel.HIGH,
    dueDate: getFormOptionalString(formData, "dueDate"),
    notes: getFormOptionalString(formData, "notes"),
  };

  const parsed = priorityItemSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid priority item." };
  }

  const system = await assertSystemAdminAccess(parsed.data.systemId, authContext.account.id);
  const ownerUserId = await normalizeOwnerId(authContext.account.id, parsed.data.ownerUserId || undefined);

  const latest = await prisma.priorityItem.findFirst({
    where: { systemId: system.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const priority = await prisma.priorityItem.create({
    data: {
      systemId: system.id,
      ownerUserId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parseOptionalDate(parsed.data.dueDate),
      notes: parsed.data.notes,
      sortOrder: (latest?.sortOrder ?? -1) + 1,
    },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId: system.id,
    entityType: "PriorityItem",
    entityId: priority.id,
    action: "priority_created",
  });

  await revalidateSystem(system.id);

  return { success: "Priority item created." };
}

export async function updatePriorityAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const authContext = await requireAdmin();
  const id = getFormString(formData, "id");

  const payload = {
    systemId: getFormString(formData, "systemId"),
    ownerUserId: getFormOptionalString(formData, "ownerUserId") ?? "",
    title: getFormString(formData, "title"),
    description: getFormOptionalString(formData, "description"),
    status: getFormString(formData, "status") as ItemStatus,
    priority: getFormString(formData, "priority") as PriorityLevel,
    dueDate: getFormOptionalString(formData, "dueDate"),
    notes: getFormOptionalString(formData, "notes"),
  };

  const parsed = priorityItemSchema.safeParse(payload);
  if (!parsed.success || !id) {
    return { error: parsed.success ? "Priority id is required." : parsed.error.issues[0]?.message };
  }

  const priorityItem = await prisma.priorityItem.findFirst({
    where: {
      id,
      systemId: parsed.data.systemId,
      system: { accountId: authContext.account.id },
    },
  });

  if (!priorityItem) {
    return { error: "Priority item not found." };
  }

  const ownerUserId = await normalizeOwnerId(authContext.account.id, parsed.data.ownerUserId || undefined);

  await prisma.priorityItem.update({
    where: { id: priorityItem.id },
    data: {
      ownerUserId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parseOptionalDate(parsed.data.dueDate),
      notes: parsed.data.notes,
    },
  });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId: priorityItem.systemId,
    entityType: "PriorityItem",
    entityId: priorityItem.id,
    action: "priority_updated",
  });

  await revalidateSystem(priorityItem.systemId);

  return { success: "Priority item updated." };
}

export async function deletePriorityAction(formData: FormData): Promise<void> {
  const authContext = await requireAdmin();
  const id = getFormString(formData, "id");
  const systemId = getFormString(formData, "systemId");

  if (!id || !systemId) return;

  const priorityItem = await prisma.priorityItem.findFirst({
    where: {
      id,
      systemId,
      system: { accountId: authContext.account.id },
    },
  });

  if (!priorityItem) return;

  await prisma.priorityItem.delete({ where: { id: priorityItem.id } });

  await logActivity({
    accountId: authContext.account.id,
    userId: authContext.user.id,
    systemId,
    entityType: "PriorityItem",
    entityId: id,
    action: "priority_deleted",
  });

  await revalidateSystem(systemId);
}

export async function updateSystemOwnerFormAction(formData: FormData): Promise<void> {
  await updateSystemOwnerAction({}, formData);
}

export async function updateSystemContentFormAction(formData: FormData): Promise<void> {
  await updateSystemContentAction({}, formData);
}

export async function createKpiFormAction(formData: FormData): Promise<void> {
  await createKpiAction({}, formData);
}

export async function updateKpiFormAction(formData: FormData): Promise<void> {
  await updateKpiAction({}, formData);
}

export async function createAnnualGoalFormAction(formData: FormData): Promise<void> {
  await createAnnualGoalAction({}, formData);
}

export async function updateAnnualGoalFormAction(formData: FormData): Promise<void> {
  await updateAnnualGoalAction({}, formData);
}

export async function createMilestoneFormAction(formData: FormData): Promise<void> {
  await createMilestoneAction({}, formData);
}

export async function updateMilestoneFormAction(formData: FormData): Promise<void> {
  await updateMilestoneAction({}, formData);
}

export async function createTaskFormAction(formData: FormData): Promise<void> {
  await createTaskAction({}, formData);
}

export async function updateTaskFormAction(formData: FormData): Promise<void> {
  await updateTaskAction({}, formData);
}

export async function createPriorityFormAction(formData: FormData): Promise<void> {
  await createPriorityAction({}, formData);
}

export async function updatePriorityFormAction(formData: FormData): Promise<void> {
  await updatePriorityAction({}, formData);
}
