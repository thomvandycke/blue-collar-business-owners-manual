import { ItemStatus, PriorityLevel, type AnnualGoal, type QuarterlyMilestone } from "@prisma/client";

import {
  createMilestoneFormAction,
  deleteMilestoneAction,
  updateMilestoneFormAction,
} from "@/actions/system-actions";
import { ItemStatusBadge, PriorityBadge } from "@/components/system/status-badges";
import { UserAvatarChip } from "@/components/system/user-avatar-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

type UserOption = {
  id: string;
  displayName: string;
  profileImageUrl: string | null;
};

type GoalOption = Pick<AnnualGoal, "id" | "title">;

type MilestoneWithOwner = QuarterlyMilestone & {
  owner: UserOption | null;
  annualGoal: GoalOption | null;
};

type QuarterlyMilestoneListProps = {
  systemId: string;
  milestones: MilestoneWithOwner[];
  goals: GoalOption[];
  users: UserOption[];
  isEditMode: boolean;
  canEdit: boolean;
};

const statuses = [ItemStatus.NOT_STARTED, ItemStatus.IN_PROGRESS, ItemStatus.BLOCKED, ItemStatus.COMPLETE];
const priorities = [PriorityLevel.LOW, PriorityLevel.MEDIUM, PriorityLevel.HIGH, PriorityLevel.CRITICAL];

export function QuarterlyMilestoneList({
  systemId,
  milestones,
  goals,
  users,
  isEditMode,
  canEdit,
}: QuarterlyMilestoneListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quarterly Milestones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {milestones.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-500">
            No milestones yet.
          </p>
        ) : (
          milestones.map((milestone) => (
            <div key={milestone.id} className="rounded-lg border border-slate-200 p-4">
              {isEditMode && canEdit ? (
                <form action={updateMilestoneFormAction} className="space-y-3">
                  <input type="hidden" name="id" defaultValue={milestone.id} />
                  <input type="hidden" name="systemId" defaultValue={systemId} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1 md:col-span-2">
                      <Label>Title</Label>
                      <Input name="title" defaultValue={milestone.title} required />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea name="description" defaultValue={milestone.description ?? ""} rows={3} />
                    </div>
                    <div className="space-y-1">
                      <Label>Quarter Label</Label>
                      <Input name="quarterLabel" defaultValue={milestone.quarterLabel ?? ""} placeholder="Q1, Q2..." />
                    </div>
                    <div className="space-y-1">
                      <Label>Linked Annual Goal</Label>
                      <Select name="annualGoalId" defaultValue={milestone.annualGoalId ?? ""}>
                        <option value="">None</option>
                        {goals.map((goal) => (
                          <option key={goal.id} value={goal.id}>
                            {goal.title}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Status</Label>
                      <Select name="status" defaultValue={milestone.status}>
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.toLowerCase()}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Priority</Label>
                      <Select name="priority" defaultValue={milestone.priority}>
                        {priorities.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority.toLowerCase()}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Owner</Label>
                      <Select name="ownerUserId" defaultValue={milestone.ownerUserId ?? ""}>
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.displayName}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        name="dueDate"
                        defaultValue={milestone.dueDate ? milestone.dueDate.toISOString().slice(0, 10) : ""}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label>Notes</Label>
                      <Textarea name="notes" defaultValue={milestone.notes ?? ""} rows={2} />
                    </div>
                  </div>
                  <Button size="sm" type="submit">
                    Save Milestone
                  </Button>
                </form>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-medium text-slate-900">{milestone.title}</h4>
                    <div className="flex gap-2">
                      <ItemStatusBadge status={milestone.status} />
                      <PriorityBadge priority={milestone.priority} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{milestone.description || "No description"}</p>
                  <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <span>Due: {formatDate(milestone.dueDate)}</span>
                    <span>Quarter: {milestone.quarterLabel || "-"}</span>
                    <span>Linked goal: {milestone.annualGoal?.title || "-"}</span>
                    <span>Notes: {milestone.notes || "-"}</span>
                  </div>
                  <UserAvatarChip name={milestone.owner?.displayName} imageUrl={milestone.owner?.profileImageUrl} />
                </div>
              )}
              {isEditMode && canEdit ? (
                <form action={deleteMilestoneAction} className="mt-3">
                  <input type="hidden" name="id" defaultValue={milestone.id} />
                  <input type="hidden" name="systemId" defaultValue={systemId} />
                  <Button type="submit" size="sm" variant="ghost" className="text-rose-700 hover:bg-rose-50">
                    Delete Milestone
                  </Button>
                </form>
              ) : null}
            </div>
          ))
        )}

        {isEditMode && canEdit ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Add Quarterly Milestone</h4>
            <form action={createMilestoneFormAction} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="systemId" defaultValue={systemId} />
              <div className="space-y-1 md:col-span-2">
                <Label>Title</Label>
                <Input name="title" required />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Description</Label>
                <Textarea name="description" rows={2} />
              </div>
              <div className="space-y-1">
                <Label>Quarter Label</Label>
                <Input name="quarterLabel" placeholder="Q1, Q2..." />
              </div>
              <div className="space-y-1">
                <Label>Linked Annual Goal</Label>
                <Select name="annualGoalId" defaultValue="">
                  <option value="">None</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select name="status" defaultValue={ItemStatus.NOT_STARTED}>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.toLowerCase()}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Priority</Label>
                <Select name="priority" defaultValue={PriorityLevel.MEDIUM}>
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority.toLowerCase()}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Owner</Label>
                <Select name="ownerUserId" defaultValue="">
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Due Date</Label>
                <Input type="date" name="dueDate" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Notes</Label>
                <Textarea name="notes" rows={2} />
              </div>
              <Button type="submit" className="md:col-span-2">
                Add Milestone
              </Button>
            </form>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
