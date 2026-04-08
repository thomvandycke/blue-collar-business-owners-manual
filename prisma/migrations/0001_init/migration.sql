-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."SystemName" AS ENUM ('MARKETING', 'SALES', 'PARTNERSHIPS', 'OPERATIONS', 'CUSTOMER_SERVICE', 'FINANCE', 'PEOPLE', 'LEADERSHIP');

-- CreateEnum
CREATE TYPE "public"."KPIType" AS ENUM ('LEADING', 'LAGGING');

-- CreateEnum
CREATE TYPE "public"."ItemStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "public"."PriorityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."UpdateFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY');

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "maxUsers" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "role" "public"."UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserInvite" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "token" TEXT NOT NULL,
    "status" "public"."InviteStatus" NOT NULL DEFAULT 'PENDING',
    "invitedByUserId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BusinessSystem" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" "public"."SystemName" NOT NULL,
    "ownerUserId" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemContent" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "gamePlanObjective" TEXT,
    "gamePlanSuccessDefinition" TEXT,
    "gamePlanFocus" TEXT,
    "gamePlanNotFocus" TEXT,
    "riggingBuildNeeds" TEXT,
    "riggingToolsProcesses" TEXT,
    "riggingOwnershipNotes" TEXT,
    "tractionWeeklyActions" TEXT,
    "tractionPrioritiesSummary" TEXT,
    "tractionNextSteps" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KPI" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."KPIType" NOT NULL,
    "targetValue" DECIMAL(65,30),
    "currentValue" DECIMAL(65,30),
    "unit" TEXT,
    "updateFrequency" "public"."UpdateFrequency",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnnualGoal" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ItemStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priority" "public"."PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuarterlyMilestone" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "annualGoalId" TEXT,
    "ownerUserId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ItemStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priority" "public"."PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "quarterLabel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuarterlyMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "annualGoalId" TEXT,
    "quarterlyMilestoneId" TEXT,
    "ownerUserId" TEXT,
    "createdByUserId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ItemStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priority" "public"."PriorityLevel" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PriorityItem" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ItemStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priority" "public"."PriorityLevel" NOT NULL DEFAULT 'HIGH',
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriorityItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivityLog" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "userId" TEXT,
    "systemId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "action" TEXT NOT NULL,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_slug_key" ON "public"."Account"("slug");

-- CreateIndex
CREATE INDEX "Account_slug_idx" ON "public"."Account"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_accountId_idx" ON "public"."User"("accountId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvite_token_key" ON "public"."UserInvite"("token");

-- CreateIndex
CREATE INDEX "UserInvite_accountId_idx" ON "public"."UserInvite"("accountId");

-- CreateIndex
CREATE INDEX "UserInvite_email_idx" ON "public"."UserInvite"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvite_accountId_email_status_key" ON "public"."UserInvite"("accountId", "email", "status");

-- CreateIndex
CREATE INDEX "BusinessSystem_accountId_idx" ON "public"."BusinessSystem"("accountId");

-- CreateIndex
CREATE INDEX "BusinessSystem_ownerUserId_idx" ON "public"."BusinessSystem"("ownerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSystem_accountId_name_key" ON "public"."BusinessSystem"("accountId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SystemContent_systemId_key" ON "public"."SystemContent"("systemId");

-- CreateIndex
CREATE INDEX "KPI_systemId_idx" ON "public"."KPI"("systemId");

-- CreateIndex
CREATE INDEX "KPI_ownerUserId_idx" ON "public"."KPI"("ownerUserId");

-- CreateIndex
CREATE INDEX "AnnualGoal_systemId_idx" ON "public"."AnnualGoal"("systemId");

-- CreateIndex
CREATE INDEX "AnnualGoal_ownerUserId_idx" ON "public"."AnnualGoal"("ownerUserId");

-- CreateIndex
CREATE INDEX "QuarterlyMilestone_systemId_idx" ON "public"."QuarterlyMilestone"("systemId");

-- CreateIndex
CREATE INDEX "QuarterlyMilestone_annualGoalId_idx" ON "public"."QuarterlyMilestone"("annualGoalId");

-- CreateIndex
CREATE INDEX "QuarterlyMilestone_ownerUserId_idx" ON "public"."QuarterlyMilestone"("ownerUserId");

-- CreateIndex
CREATE INDEX "Task_systemId_idx" ON "public"."Task"("systemId");

-- CreateIndex
CREATE INDEX "Task_annualGoalId_idx" ON "public"."Task"("annualGoalId");

-- CreateIndex
CREATE INDEX "Task_quarterlyMilestoneId_idx" ON "public"."Task"("quarterlyMilestoneId");

-- CreateIndex
CREATE INDEX "Task_ownerUserId_idx" ON "public"."Task"("ownerUserId");

-- CreateIndex
CREATE INDEX "PriorityItem_systemId_idx" ON "public"."PriorityItem"("systemId");

-- CreateIndex
CREATE INDEX "PriorityItem_ownerUserId_idx" ON "public"."PriorityItem"("ownerUserId");

-- CreateIndex
CREATE INDEX "ActivityLog_accountId_createdAt_idx" ON "public"."ActivityLog"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_systemId_idx" ON "public"."ActivityLog"("systemId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "public"."Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "public"."Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "public"."PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "public"."PasswordResetToken"("userId", "expiresAt");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserInvite" ADD CONSTRAINT "UserInvite_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserInvite" ADD CONSTRAINT "UserInvite_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessSystem" ADD CONSTRAINT "BusinessSystem_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessSystem" ADD CONSTRAINT "BusinessSystem_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SystemContent" ADD CONSTRAINT "SystemContent_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."BusinessSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KPI" ADD CONSTRAINT "KPI_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."BusinessSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KPI" ADD CONSTRAINT "KPI_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnnualGoal" ADD CONSTRAINT "AnnualGoal_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."BusinessSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnnualGoal" ADD CONSTRAINT "AnnualGoal_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuarterlyMilestone" ADD CONSTRAINT "QuarterlyMilestone_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."BusinessSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuarterlyMilestone" ADD CONSTRAINT "QuarterlyMilestone_annualGoalId_fkey" FOREIGN KEY ("annualGoalId") REFERENCES "public"."AnnualGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuarterlyMilestone" ADD CONSTRAINT "QuarterlyMilestone_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."BusinessSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_annualGoalId_fkey" FOREIGN KEY ("annualGoalId") REFERENCES "public"."AnnualGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_quarterlyMilestoneId_fkey" FOREIGN KEY ("quarterlyMilestoneId") REFERENCES "public"."QuarterlyMilestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PriorityItem" ADD CONSTRAINT "PriorityItem_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."BusinessSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PriorityItem" ADD CONSTRAINT "PriorityItem_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."BusinessSystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

