import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSystemBySlug } from "@/lib/system-config";

export async function getSystemPageData(accountId: string, systemSlug: string) {
  const definition = getSystemBySlug(systemSlug);

  if (!definition) {
    notFound();
  }

  const [system, users] = await Promise.all([
    prisma.businessSystem.findFirst({
      where: {
        accountId,
        name: definition.name,
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            profileImageUrl: true,
          },
        },
        content: true,
        kpis: {
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
                profileImageUrl: true,
              },
            },
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
        annualGoals: {
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
                profileImageUrl: true,
              },
            },
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
        milestones: {
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
                profileImageUrl: true,
              },
            },
            annualGoal: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
        tasks: {
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
                profileImageUrl: true,
              },
            },
            annualGoal: {
              select: {
                id: true,
                title: true,
              },
            },
            quarterlyMilestone: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
        priorities: {
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
                profileImageUrl: true,
              },
            },
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    }),
    prisma.user.findMany({
      where: {
        accountId,
        isActive: true,
      },
      select: {
        id: true,
        displayName: true,
        profileImageUrl: true,
        role: true,
      },
      orderBy: [{ role: "asc" }, { displayName: "asc" }],
    }),
  ]);

  if (!system) {
    notFound();
  }

  return {
    definition,
    system,
    users,
  };
}
