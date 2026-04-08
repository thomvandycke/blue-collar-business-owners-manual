import Link from "next/link";
import { ItemStatus } from "@prisma/client";

import { UserAvatarChip } from "@/components/system/user-avatar-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintButton } from "@/components/ui/print-button";
import { requireUser } from "@/lib/auth/session";
import { getSystemPageData } from "@/lib/system-data";
import { formatDate } from "@/lib/utils";

function SummaryBlock({ title, content }: { title: string; content?: string | null }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-text-secondary">{title}</h3>
      <p className="rounded-md border border-border-subtle bg-surface-2 p-3 text-sm text-text-secondary whitespace-pre-wrap">
        {content?.trim() || "Not filled yet."}
      </p>
    </div>
  );
}

export default async function SystemSummaryPage({
  params,
}: {
  params: Promise<{ systemName: string }>;
}) {
  const authContext = await requireUser();
  const { systemName } = await params;

  const { definition, system } = await getSystemPageData(authContext.account.id, systemName);

  const activeGoals = system.annualGoals.filter((goal) => goal.status !== ItemStatus.COMPLETE);
  const activeMilestones = system.milestones.filter((milestone) => milestone.status !== ItemStatus.COMPLETE);
  const activeTasks = system.tasks.filter((task) => task.status !== ItemStatus.COMPLETE);
  const activeKpis = system.kpis.filter((kpi) => kpi.isActive);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted">One-Page Summary</p>
          <h1 className="text-2xl font-semibold text-text-primary">{definition.label}</h1>
          <p className="text-sm text-text-secondary">Last updated {formatDate(system.updatedAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/systems/${definition.slug}`}>Back to System</Link>
          </Button>
          <PrintButton />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Owner</CardTitle>
        </CardHeader>
        <CardContent>
          <UserAvatarChip name={system.owner?.displayName} imageUrl={system.owner?.profileImageUrl} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Game Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryBlock title="Objective" content={system.content?.gamePlanObjective} />
            <SummaryBlock title="Success Definition" content={system.content?.gamePlanSuccessDefinition} />
            <SummaryBlock title="Focus" content={system.content?.gamePlanFocus} />
            <SummaryBlock title="Not Focus" content={system.content?.gamePlanNotFocus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rigging</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryBlock title="Build Needs" content={system.content?.riggingBuildNeeds} />
            <SummaryBlock title="Tools & Processes" content={system.content?.riggingToolsProcesses} />
            <SummaryBlock title="Ownership Notes" content={system.content?.riggingOwnershipNotes} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Traction</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <SummaryBlock title="Weekly Actions" content={system.content?.tractionWeeklyActions} />
            <SummaryBlock title="Priorities Summary" content={system.content?.tractionPrioritiesSummary} />
            <SummaryBlock title="Next Steps" content={system.content?.tractionNextSteps} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Indicators Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeKpis.length === 0 ? (
            <p className="text-sm text-text-muted">No active KPIs configured.</p>
          ) : (
            activeKpis.map((kpi) => (
              <div key={kpi.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-subtle p-3 text-sm">
                <div>
                  <p className="font-medium text-text-primary">{kpi.name}</p>
                  <p className="text-text-secondary">{kpi.type.toLowerCase()} • {kpi.updateFrequency?.toLowerCase() || "no cadence"}</p>
                </div>
                <div className="text-text-secondary">
                  {kpi.currentValue?.toString() || "-"} / {kpi.targetValue?.toString() || "-"} {kpi.unit || ""}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Annual Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {activeGoals.length === 0 ? (
              <p className="text-text-muted">No active annual goals.</p>
            ) : (
              activeGoals.map((goal) => <p key={goal.id}>• {goal.title}</p>)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Milestones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {activeMilestones.length === 0 ? (
              <p className="text-text-muted">No active milestones.</p>
            ) : (
              activeMilestones.map((milestone) => <p key={milestone.id}>• {milestone.title}</p>)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {activeTasks.length === 0 ? (
              <p className="text-text-muted">No active tasks.</p>
            ) : (
              activeTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-2">
                  <span>{task.title}</span>
                  <Badge tone={task.dueDate && task.dueDate < new Date() ? "danger" : "muted"}>
                    {formatDate(task.dueDate)}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
