import {
  ItemStatus,
  KPIType,
  PriorityLevel,
  PrismaClient,
  SystemName,
  UpdateFrequency,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const systems = [
  SystemName.MARKETING,
  SystemName.SALES,
  SystemName.PARTNERSHIPS,
  SystemName.OPERATIONS,
  SystemName.CUSTOMER_SERVICE,
  SystemName.FINANCE,
  SystemName.PEOPLE,
  SystemName.LEADERSHIP,
];

const readableSystemName = (name: SystemName) =>
  name
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin123!", 12);
  const memberPasswordHash = await bcrypt.hash("Member123!", 12);

  const account = await prisma.account.upsert({
    where: { slug: "demo-blue-collar-shop" },
    update: {
      name: "Demo Blue Collar Shop",
      primaryColor: "#1f4f46",
    },
    create: {
      name: "Demo Blue Collar Shop",
      slug: "demo-blue-collar-shop",
      primaryColor: "#1f4f46",
      maxUsers: 3,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo-bluecollar.com" },
    update: {
      accountId: account.id,
      role: UserRole.ADMIN,
      displayName: "Alex Owner",
      isActive: true,
      passwordHash: adminPasswordHash,
    },
    create: {
      accountId: account.id,
      email: "admin@demo-bluecollar.com",
      displayName: "Alex Owner",
      role: UserRole.ADMIN,
      passwordHash: adminPasswordHash,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@demo-bluecollar.com" },
    update: {
      accountId: account.id,
      role: UserRole.MEMBER,
      displayName: "Sam Crew Lead",
      isActive: true,
      passwordHash: memberPasswordHash,
    },
    create: {
      accountId: account.id,
      email: "member@demo-bluecollar.com",
      displayName: "Sam Crew Lead",
      role: UserRole.MEMBER,
      passwordHash: memberPasswordHash,
    },
  });

  const systemRecords = [] as Array<{ id: string; name: SystemName }>;

  for (const [index, systemName] of systems.entries()) {
    const ownerUserId = index % 2 === 0 ? admin.id : member.id;

    const system = await prisma.businessSystem.upsert({
      where: {
        accountId_name: {
          accountId: account.id,
          name: systemName,
        },
      },
      update: {
        sortOrder: index,
        ownerUserId,
      },
      create: {
        accountId: account.id,
        name: systemName,
        ownerUserId,
        sortOrder: index,
      },
    });

    await prisma.systemContent.upsert({
      where: { systemId: system.id },
      update: {
        gamePlanObjective: `Build a clear ${readableSystemName(systemName)} operating rhythm.`,
        gamePlanSuccessDefinition: "Team can execute without confusion and owners know the numbers.",
        gamePlanFocus: "Simple repeatable process, clear ownership, and weekly follow-through.",
        gamePlanNotFocus: "No shiny-object side projects this quarter.",
        riggingBuildNeeds: "Define playbook steps and accountability checkpoints.",
        riggingToolsProcesses: "Use one shared weekly review process in this app.",
        riggingOwnershipNotes: "System owner runs weekly review and updates blockers.",
        tractionWeeklyActions: "Review priorities every Monday and close at least one blocker.",
        tractionPrioritiesSummary: "Focus on the 1-3 moves that impact this system the most.",
        tractionNextSteps: "Confirm owners, set due dates, and update statuses weekly.",
      },
      create: {
        systemId: system.id,
        gamePlanObjective: `Build a clear ${readableSystemName(systemName)} operating rhythm.`,
        gamePlanSuccessDefinition: "Team can execute without confusion and owners know the numbers.",
        gamePlanFocus: "Simple repeatable process, clear ownership, and weekly follow-through.",
        gamePlanNotFocus: "No shiny-object side projects this quarter.",
        riggingBuildNeeds: "Define playbook steps and accountability checkpoints.",
        riggingToolsProcesses: "Use one shared weekly review process in this app.",
        riggingOwnershipNotes: "System owner runs weekly review and updates blockers.",
        tractionWeeklyActions: "Review priorities every Monday and close at least one blocker.",
        tractionPrioritiesSummary: "Focus on the 1-3 moves that impact this system the most.",
        tractionNextSteps: "Confirm owners, set due dates, and update statuses weekly.",
      },
    });

    await prisma.kPI.deleteMany({ where: { systemId: system.id } });
    await prisma.task.deleteMany({ where: { systemId: system.id } });
    await prisma.quarterlyMilestone.deleteMany({ where: { systemId: system.id } });
    await prisma.annualGoal.deleteMany({ where: { systemId: system.id } });
    await prisma.priorityItem.deleteMany({ where: { systemId: system.id } });

    systemRecords.push({ id: system.id, name: systemName });
  }

  const marketingSystem = systemRecords.find((s) => s.name === SystemName.MARKETING);
  const operationsSystem = systemRecords.find((s) => s.name === SystemName.OPERATIONS);

  if (marketingSystem) {
    await prisma.kPI.createMany({
      data: [
        {
          systemId: marketingSystem.id,
          ownerUserId: admin.id,
          name: "Qualified Leads per Month",
          type: KPIType.LEADING,
          targetValue: 40,
          currentValue: 28,
          unit: "leads",
          updateFrequency: UpdateFrequency.MONTHLY,
          isActive: true,
          sortOrder: 0,
        },
        {
          systemId: marketingSystem.id,
          ownerUserId: member.id,
          name: "Cost per Lead",
          type: KPIType.LAGGING,
          targetValue: 75,
          currentValue: 92,
          unit: "USD",
          updateFrequency: UpdateFrequency.MONTHLY,
          isActive: true,
          sortOrder: 1,
        },
      ],
    });

    const goal = await prisma.annualGoal.create({
      data: {
        systemId: marketingSystem.id,
        ownerUserId: admin.id,
        title: "Build repeatable local lead engine",
        description: "Create a consistent lead flow without relying on referrals alone.",
        status: ItemStatus.IN_PROGRESS,
        priority: PriorityLevel.HIGH,
        dueDate: new Date(new Date().getFullYear(), 11, 15),
      },
    });

    const milestone = await prisma.quarterlyMilestone.create({
      data: {
        systemId: marketingSystem.id,
        annualGoalId: goal.id,
        ownerUserId: member.id,
        title: "Launch seasonal campaign and referral funnel",
        description: "Run one seasonal promotion and one referral offer.",
        status: ItemStatus.IN_PROGRESS,
        priority: PriorityLevel.HIGH,
        dueDate: new Date(new Date().getFullYear(), 8, 30),
        quarterLabel: "Q3",
      },
    });

    await prisma.task.createMany({
      data: [
        {
          systemId: marketingSystem.id,
          annualGoalId: goal.id,
          quarterlyMilestoneId: milestone.id,
          ownerUserId: member.id,
          createdByUserId: admin.id,
          title: "Finalize landing page offer",
          status: ItemStatus.IN_PROGRESS,
          priority: PriorityLevel.HIGH,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
        },
        {
          systemId: marketingSystem.id,
          annualGoalId: goal.id,
          quarterlyMilestoneId: milestone.id,
          ownerUserId: admin.id,
          createdByUserId: admin.id,
          title: "Approve monthly ad budget",
          status: ItemStatus.NOT_STARTED,
          priority: PriorityLevel.MEDIUM,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        },
      ],
    });

    await prisma.priorityItem.createMany({
      data: [
        {
          systemId: marketingSystem.id,
          ownerUserId: admin.id,
          title: "Tighten conversion rate on quote form",
          status: ItemStatus.IN_PROGRESS,
          priority: PriorityLevel.CRITICAL,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
      ],
    });
  }

  if (operationsSystem) {
    await prisma.kPI.create({
      data: {
        systemId: operationsSystem.id,
        ownerUserId: member.id,
        name: "Jobs Completed On Time",
        type: KPIType.LEADING,
        targetValue: 95,
        currentValue: 88,
        unit: "%",
        updateFrequency: UpdateFrequency.WEEKLY,
        isActive: true,
      },
    });

    const operationsGoal = await prisma.annualGoal.create({
      data: {
        systemId: operationsSystem.id,
        ownerUserId: member.id,
        title: "Standardize field execution playbook",
        status: ItemStatus.IN_PROGRESS,
        priority: PriorityLevel.HIGH,
      },
    });

    await prisma.task.create({
      data: {
        systemId: operationsSystem.id,
        annualGoalId: operationsGoal.id,
        ownerUserId: member.id,
        createdByUserId: admin.id,
        title: "Document start-of-day checklist",
        description: "Create one-page checklist and train crew leads.",
        status: ItemStatus.NOT_STARTED,
        priority: PriorityLevel.MEDIUM,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      },
    });
  }

  await prisma.activityLog.create({
    data: {
      accountId: account.id,
      userId: admin.id,
      action: "seed_completed",
      entityType: "Seed",
      metadataJson: {
        account: account.slug,
        systemsCreated: systems.length,
      },
    },
  });

  console.log("Seed complete");
  console.log("Demo admin:", "admin@demo-bluecollar.com", "password: Admin123!");
  console.log("Demo member:", "member@demo-bluecollar.com", "password: Member123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
