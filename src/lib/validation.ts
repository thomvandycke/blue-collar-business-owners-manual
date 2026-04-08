import { InviteStatus, ItemStatus, KPIType, PriorityLevel, UpdateFrequency, UserRole } from "@prisma/client";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

export const signupSchema = z.object({
  accountName: z.string().min(2).max(100),
  displayName: z.string().min(2).max(100),
  email: z.string().email(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10),
  displayName: z.string().min(2).max(100),
  password: passwordSchema,
});

export const systemContentSchema = z.object({
  systemId: z.string().cuid(),
  gamePlanObjective: z.string().max(5000).optional(),
  gamePlanSuccessDefinition: z.string().max(5000).optional(),
  gamePlanFocus: z.string().max(5000).optional(),
  gamePlanNotFocus: z.string().max(5000).optional(),
  riggingBuildNeeds: z.string().max(5000).optional(),
  riggingToolsProcesses: z.string().max(5000).optional(),
  riggingOwnershipNotes: z.string().max(5000).optional(),
  tractionWeeklyActions: z.string().max(5000).optional(),
  tractionPrioritiesSummary: z.string().max(5000).optional(),
  tractionNextSteps: z.string().max(5000).optional(),
});

export const kpiCreateSchema = z.object({
  systemId: z.string().cuid(),
  ownerUserId: z.string().cuid().optional().or(z.literal("")),
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  type: z.nativeEnum(KPIType),
  targetValue: z.coerce.number().optional(),
  currentValue: z.coerce.number().optional(),
  unit: z.string().max(40).optional(),
  updateFrequency: z.nativeEnum(UpdateFrequency).optional(),
  isActive: z.boolean().default(true),
});

export const kpiUpdateSchema = kpiCreateSchema.extend({
  id: z.string().cuid(),
});

export const planningItemSchema = z.object({
  systemId: z.string().cuid(),
  ownerUserId: z.string().cuid().optional().or(z.literal("")),
  title: z.string().min(2).max(180),
  description: z.string().max(3000).optional(),
  status: z.nativeEnum(ItemStatus),
  priority: z.nativeEnum(PriorityLevel),
  dueDate: z.string().optional(),
  notes: z.string().max(3000).optional(),
});

export const annualGoalSchema = planningItemSchema;

export const quarterlyMilestoneSchema = planningItemSchema.extend({
  annualGoalId: z.string().cuid().optional().or(z.literal("")),
  quarterLabel: z.string().max(12).optional(),
});

export const taskSchema = planningItemSchema.extend({
  annualGoalId: z.string().cuid().optional().or(z.literal("")),
  quarterlyMilestoneId: z.string().cuid().optional().or(z.literal("")),
});

export const priorityItemSchema = planningItemSchema;

export const accountBrandingSchema = z.object({
  name: z.string().min(2).max(120),
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/, "Use a valid hex color.")
    .optional()
    .or(z.literal("")),
  logoUrl: z.string().max(500000).optional(),
});

export const profileSchema = z.object({
  displayName: z.string().min(2).max(100),
  profileImageUrl: z.string().max(500000).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const requestResetSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
});

export const inviteStatusSchema = z.nativeEnum(InviteStatus);
