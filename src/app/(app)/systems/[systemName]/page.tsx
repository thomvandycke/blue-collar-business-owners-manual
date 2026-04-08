import { UserRole } from "@prisma/client";

import { updateSystemContentFormAction, updateSystemOwnerFormAction } from "@/actions/system-actions";
import { AnnualGoalList } from "@/components/system/annual-goal-list";
import { EditableSectionCard } from "@/components/system/editable-section-card";
import { KpiTable } from "@/components/system/kpi-table";
import { PriorityList } from "@/components/system/priority-list";
import { QuarterlyMilestoneList } from "@/components/system/quarterly-milestone-list";
import { SystemHeader } from "@/components/system/system-header";
import { TaskList } from "@/components/system/task-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireUser } from "@/lib/auth/session";
import { getSystemPageData } from "@/lib/system-data";

export default async function SystemPage({
  params,
  searchParams,
}: {
  params: Promise<{ systemName: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const authContext = await requireUser();
  const { systemName } = await params;
  const query = await searchParams;

  const { definition, system, users } = await getSystemPageData(authContext.account.id, systemName);

  const canEdit = authContext.user.role === UserRole.ADMIN;
  const isEditMode = canEdit && query.mode === "edit";

  return (
    <div className="space-y-6">
      <SystemHeader
        systemName={definition.name}
        owner={system.owner}
        updatedAt={system.updatedAt}
        isEditMode={isEditMode}
        canEdit={canEdit}
      />

      {isEditMode && canEdit ? (
        <Card>
          <CardHeader>
            <CardTitle>System Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={updateSystemOwnerFormAction} className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input type="hidden" name="systemId" defaultValue={system.id} />
              <div className="space-y-1">
                <Label>System Owner</Label>
                <Select name="ownerUserId" defaultValue={system.ownerUserId ?? ""}>
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="self-end">
                <Button type="submit" size="sm">
                  Update Owner
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <form action={updateSystemContentFormAction} className="space-y-6">
        <input type="hidden" name="systemId" defaultValue={system.id} />

        <div className="grid gap-4 lg:grid-cols-2">
          <EditableSectionCard
            title="Game Plan"
            isEditMode={isEditMode}
            fields={[
              {
                name: "gamePlanObjective",
                label: "Objective",
                helper: "What are we trying to accomplish?",
                value: system.content?.gamePlanObjective,
              },
              {
                name: "gamePlanSuccessDefinition",
                label: "Success Definition",
                helper: "What does success look like?",
                value: system.content?.gamePlanSuccessDefinition,
              },
              {
                name: "gamePlanFocus",
                label: "Focus",
                helper: "What are we focusing on?",
                value: system.content?.gamePlanFocus,
              },
              {
                name: "gamePlanNotFocus",
                label: "Not Focus",
                helper: "What are we intentionally not focusing on?",
                value: system.content?.gamePlanNotFocus,
              },
            ]}
          />
          <EditableSectionCard
            title="Rigging"
            isEditMode={isEditMode}
            fields={[
              {
                name: "riggingBuildNeeds",
                label: "Build Needs",
                helper: "What needs to be built or put in place?",
                value: system.content?.riggingBuildNeeds,
              },
              {
                name: "riggingToolsProcesses",
                label: "Tools & Processes",
                helper: "What tools, processes, or workflows are required?",
                value: system.content?.riggingToolsProcesses,
              },
              {
                name: "riggingOwnershipNotes",
                label: "Ownership Notes",
                helper: "Who owns this and how will ownership be maintained?",
                value: system.content?.riggingOwnershipNotes,
              },
            ]}
          />
          <EditableSectionCard
            title="Traction"
            isEditMode={isEditMode}
            fields={[
              {
                name: "tractionWeeklyActions",
                label: "Weekly Actions",
                helper: "What needs to happen this week?",
                value: system.content?.tractionWeeklyActions,
              },
              {
                name: "tractionPrioritiesSummary",
                label: "Priorities Summary",
                helper: "What priorities matter most right now?",
                value: system.content?.tractionPrioritiesSummary,
              },
              {
                name: "tractionNextSteps",
                label: "Next Steps",
                helper: "What are the next clear execution steps?",
                value: system.content?.tractionNextSteps,
              },
            ]}
          />
          <Card>
            <CardHeader>
              <CardTitle>Indicators Guidance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-secondary">
              <p>Use the KPI section below to track up to 5 KPIs for this system.</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Include leading and lagging indicators.</li>
                <li>Assign ownership so updates happen consistently.</li>
                <li>Keep units and targets clear for easy weekly review.</li>
              </ul>
              {isEditMode ? (
                <label className="flex items-center gap-2 rounded-md bg-surface-2 p-2">
                  <input type="checkbox" name="isCompleted" defaultChecked={system.isCompleted} />
                  Mark this system as completed
                </label>
              ) : (
                <p>
                  Completion status: <strong>{system.isCompleted ? "Completed" : "In progress"}</strong>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {isEditMode ? (
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <a href={`/systems/${definition.slug}`}>Cancel</a>
            </Button>
            <SubmitButton type="submit">Save GRIT Content</SubmitButton>
          </div>
        ) : null}
      </form>

      <KpiTable
        systemId={system.id}
        kpis={system.kpis}
        users={users}
        isEditMode={isEditMode}
        canEdit={canEdit}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <AnnualGoalList
          systemId={system.id}
          goals={system.annualGoals}
          users={users}
          isEditMode={isEditMode}
          canEdit={canEdit}
        />
        <QuarterlyMilestoneList
          systemId={system.id}
          milestones={system.milestones}
          goals={system.annualGoals.map((goal) => ({ id: goal.id, title: goal.title }))}
          users={users}
          isEditMode={isEditMode}
          canEdit={canEdit}
        />
      </div>

      <TaskList
        systemId={system.id}
        tasks={system.tasks}
        goals={system.annualGoals.map((goal) => ({ id: goal.id, title: goal.title }))}
        milestones={system.milestones.map((milestone) => ({ id: milestone.id, title: milestone.title }))}
        users={users}
        isEditMode={isEditMode}
        canAdminEdit={canEdit}
        currentUserId={authContext.user.id}
      />

      <PriorityList
        systemId={system.id}
        items={system.priorities}
        users={users}
        isEditMode={isEditMode}
        canEdit={canEdit}
      />
    </div>
  );
}
