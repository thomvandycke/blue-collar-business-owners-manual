import Link from "next/link";
import { ItemStatus } from "@prisma/client";

import { SystemHealthCard } from "@/components/dashboard/system-health-card";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getSystemByName } from "@/lib/system-config";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const authContext = await requireUser();

  const [systems, myTasks, overdueTasks, upcomingMilestones, topPriorities, recentActivity, allKpis] =
    await Promise.all([
      prisma.businessSystem.findMany({
        where: { accountId: authContext.account.id },
        include: {
          owner: {
            select: {
              displayName: true,
            },
          },
          tasks: {
            select: {
              id: true,
              dueDate: true,
              status: true,
            },
          },
          kpis: {
            where: { isActive: true },
            select: {
              id: true,
              targetValue: true,
              currentValue: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.task.findMany({
        where: {
          system: { accountId: authContext.account.id },
          ownerUserId: authContext.user.id,
          status: { not: ItemStatus.COMPLETE },
        },
        include: {
          system: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 8,
      }),
      prisma.task.findMany({
        where: {
          system: { accountId: authContext.account.id },
          dueDate: { lt: new Date() },
          status: { not: ItemStatus.COMPLETE },
        },
        include: {
          owner: {
            select: {
              displayName: true,
            },
          },
          system: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { dueDate: "asc" },
        take: 8,
      }),
      prisma.quarterlyMilestone.findMany({
        where: {
          system: { accountId: authContext.account.id },
          dueDate: { gte: new Date() },
          status: { not: ItemStatus.COMPLETE },
        },
        include: {
          system: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { dueDate: "asc" },
        take: 8,
      }),
      prisma.priorityItem.findMany({
        where: {
          system: { accountId: authContext.account.id },
          status: { not: ItemStatus.COMPLETE },
        },
        include: {
          owner: {
            select: {
              displayName: true,
            },
          },
          system: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
        take: 8,
      }),
      prisma.activityLog.findMany({
        where: {
          accountId: authContext.account.id,
        },
        include: {
          user: {
            select: {
              displayName: true,
            },
          },
          system: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.kPI.findMany({
        where: {
          system: { accountId: authContext.account.id },
          isActive: true,
        },
      }),
    ]);

  const completeSystems = systems.filter((system) => system.isCompleted).length;
  const completionPercentage = systems.length > 0 ? Math.round((completeSystems / systems.length) * 100) : 0;

  const onTargetKpis = allKpis.filter((kpi) => {
    if (kpi.targetValue == null || kpi.currentValue == null) return false;
    return Number(kpi.currentValue) >= Number(kpi.targetValue);
  }).length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border-subtle bg-surface-1 p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Keep execution simple: update your weekly traction, priorities, and numbers in one place.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-surface-2 p-3">
            <p className="text-xs uppercase tracking-wide text-text-muted">Overall Completion</p>
            <p className="text-xl font-semibold text-text-primary">{completionPercentage}%</p>
          </div>
          <div className="rounded-lg bg-surface-2 p-3">
            <p className="text-xs uppercase tracking-wide text-text-muted">KPI Rollup</p>
            <p className="text-xl font-semibold text-text-primary">
              {allKpis.length === 0 ? "No KPIs" : `${onTargetKpis}/${allKpis.length} on target`}
            </p>
          </div>
          <div className="rounded-lg bg-surface-2 p-3">
            <p className="text-xs uppercase tracking-wide text-text-muted">Overdue Tasks</p>
            <p className="text-xl font-semibold text-danger">{overdueTasks.length}</p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-text-primary">System Health</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {systems.map((system) => {
            const openTasks = system.tasks.filter((task) => task.status !== ItemStatus.COMPLETE).length;
            const overdue = system.tasks.filter(
              (task) => task.status !== ItemStatus.COMPLETE && task.dueDate && task.dueDate < new Date(),
            ).length;
            const doneTasks = system.tasks.filter((task) => task.status === ItemStatus.COMPLETE).length;
            const completion =
              system.tasks.length > 0 ? Math.round((doneTasks / system.tasks.length) * 100) : system.isCompleted ? 100 : 0;

            return (
              <SystemHealthCard
                key={system.id}
                systemName={system.name}
                ownerName={system.owner?.displayName}
                kpiCount={system.kpis.length}
                openTasks={openTasks}
                overdueTasks={overdue}
                completion={completion}
              />
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <WidgetCard title="My Tasks" subtitle="Assigned to you">
          <div className="space-y-2 text-sm">
            {myTasks.length === 0 ? (
              <p className="text-text-muted">No active tasks assigned to you.</p>
            ) : (
              myTasks.map((task) => {
                const system = getSystemByName(task.system.name);
                return (
                  <div key={task.id} className="rounded-md border border-border-subtle p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-text-primary">{task.title}</p>
                        <p className="text-text-muted">{system?.label}</p>
                      </div>
                      <Badge tone={task.dueDate && task.dueDate < new Date() ? "danger" : "muted"}>
                        {formatDate(task.dueDate)}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </WidgetCard>

        <WidgetCard title="Top Priorities" subtitle="Across all systems">
          <div className="space-y-2 text-sm">
            {topPriorities.length === 0 ? (
              <p className="text-text-muted">No open priorities.</p>
            ) : (
              topPriorities.map((item) => (
                <div key={item.id} className="rounded-md border border-border-subtle p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-text-primary">{item.title}</p>
                      <p className="text-text-muted">
                        {getSystemByName(item.system.name)?.label} • {item.owner?.displayName || "Unassigned"}
                      </p>
                    </div>
                    <Badge tone={item.priority === "CRITICAL" ? "danger" : item.priority === "HIGH" ? "warning" : "muted"}>
                      {item.priority.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </WidgetCard>

        <WidgetCard title="Upcoming Quarterly Milestones">
          <div className="space-y-2 text-sm">
            {upcomingMilestones.length === 0 ? (
              <p className="text-text-muted">No upcoming milestones.</p>
            ) : (
              upcomingMilestones.map((milestone) => (
                <div key={milestone.id} className="rounded-md border border-border-subtle p-3">
                  <p className="font-medium text-text-primary">{milestone.title}</p>
                  <p className="text-text-muted">
                    {getSystemByName(milestone.system.name)?.label} • Due {formatDate(milestone.dueDate)}
                  </p>
                </div>
              ))
            )}
          </div>
        </WidgetCard>

        <WidgetCard title="Recent Activity">
          <div className="space-y-2 text-sm">
            {recentActivity.length === 0 ? (
              <p className="text-text-muted">No activity yet.</p>
            ) : (
              recentActivity.map((entry) => (
                <div key={entry.id} className="rounded-md border border-border-subtle p-3">
                  <p className="font-medium text-text-primary">
                    {entry.user?.displayName || "System"} • {entry.action.replaceAll("_", " ")}
                  </p>
                  <p className="text-text-muted">
                    {entry.system ? `${getSystemByName(entry.system.name)?.label} • ` : ""}
                    {formatDate(entry.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </WidgetCard>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-1 p-4 text-sm text-text-secondary">
        Need a one-page system snapshot? Open any system and click <strong>Summary</strong>.
        <Link href="/systems/marketing" className="ml-2 text-accent-primary hover:underline">
          Start with Marketing
        </Link>
      </div>
    </div>
  );
}
