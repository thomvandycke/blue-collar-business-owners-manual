import { ItemStatus, PriorityLevel, type AnnualGoal, type QuarterlyMilestone, type Task } from "@prisma/client";

import { createTaskFormAction, deleteTaskAction, updateTaskFormAction } from "@/actions/system-actions";
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
type MilestoneOption = Pick<QuarterlyMilestone, "id" | "title">;

type TaskWithRelations = Task & {
  owner: UserOption | null;
  annualGoal: GoalOption | null;
  quarterlyMilestone: MilestoneOption | null;
};

type TaskListProps = {
  systemId: string;
  tasks: TaskWithRelations[];
  goals: GoalOption[];
  milestones: MilestoneOption[];
  users: UserOption[];
  isEditMode: boolean;
  canAdminEdit: boolean;
  currentUserId: string;
};

const statuses = [ItemStatus.NOT_STARTED, ItemStatus.IN_PROGRESS, ItemStatus.BLOCKED, ItemStatus.COMPLETE];
const priorities = [PriorityLevel.LOW, PriorityLevel.MEDIUM, PriorityLevel.HIGH, PriorityLevel.CRITICAL];

export function TaskList({
  systemId,
  tasks,
  goals,
  milestones,
  users,
  isEditMode,
  canAdminEdit,
  currentUserId,
}: TaskListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-500">
            No tasks yet.
          </p>
        ) : (
          tasks.map((task) => {
            const canMemberUpdate = !canAdminEdit && task.ownerUserId === currentUserId;
            return (
              <div key={task.id} className="rounded-lg border border-slate-200 p-4">
                {isEditMode && canAdminEdit ? (
                  <form action={updateTaskFormAction} className="space-y-3">
                    <input type="hidden" name="id" defaultValue={task.id} />
                    <input type="hidden" name="systemId" defaultValue={systemId} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1 md:col-span-2">
                        <Label>Title</Label>
                        <Input name="title" defaultValue={task.title} required />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea name="description" defaultValue={task.description ?? ""} rows={2} />
                      </div>
                      <div className="space-y-1">
                        <Label>Status</Label>
                        <Select name="status" defaultValue={task.status}>
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status.toLowerCase()}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Priority</Label>
                        <Select name="priority" defaultValue={task.priority}>
                          {priorities.map((priority) => (
                            <option key={priority} value={priority}>
                              {priority.toLowerCase()}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Owner</Label>
                        <Select name="ownerUserId" defaultValue={task.ownerUserId ?? ""}>
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
                          defaultValue={task.dueDate ? task.dueDate.toISOString().slice(0, 10) : ""}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Annual Goal</Label>
                        <Select name="annualGoalId" defaultValue={task.annualGoalId ?? ""}>
                          <option value="">None</option>
                          {goals.map((goal) => (
                            <option key={goal.id} value={goal.id}>
                              {goal.title}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Quarterly Milestone</Label>
                        <Select name="quarterlyMilestoneId" defaultValue={task.quarterlyMilestoneId ?? ""}>
                          <option value="">None</option>
                          {milestones.map((milestone) => (
                            <option key={milestone.id} value={milestone.id}>
                              {milestone.title}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label>Notes</Label>
                        <Textarea name="notes" defaultValue={task.notes ?? ""} rows={2} />
                      </div>
                    </div>
                    <Button size="sm" type="submit">
                      Save Task
                    </Button>
                  </form>
                ) : canMemberUpdate ? (
                  <form action={updateTaskFormAction} className="space-y-2">
                    <input type="hidden" name="id" defaultValue={task.id} />
                    <input type="hidden" name="systemId" defaultValue={systemId} />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-medium text-slate-900">{task.title}</h4>
                      <div className="flex gap-2">
                        <ItemStatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{task.description || "No description"}</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Status</Label>
                        <Select name="status" defaultValue={task.status}>
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status.toLowerCase()}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Notes</Label>
                        <Textarea name="notes" defaultValue={task.notes ?? ""} rows={2} />
                      </div>
                    </div>
                    <Button size="sm" type="submit">
                      Update My Task
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-medium text-slate-900">{task.title}</h4>
                      <div className="flex gap-2">
                        <ItemStatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{task.description || "No description"}</p>
                    <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <span>Due: {formatDate(task.dueDate)}</span>
                      <span>Notes: {task.notes || "-"}</span>
                      <span>Annual goal: {task.annualGoal?.title || "-"}</span>
                      <span>Milestone: {task.quarterlyMilestone?.title || "-"}</span>
                    </div>
                    <UserAvatarChip name={task.owner?.displayName} imageUrl={task.owner?.profileImageUrl} />
                  </div>
                )}
                {isEditMode && canAdminEdit ? (
                  <form action={deleteTaskAction} className="mt-3">
                    <input type="hidden" name="id" defaultValue={task.id} />
                    <input type="hidden" name="systemId" defaultValue={systemId} />
                    <Button type="submit" size="sm" variant="ghost" className="text-rose-700 hover:bg-rose-50">
                      Delete Task
                    </Button>
                  </form>
                ) : null}
              </div>
            );
          })
        )}

        {isEditMode && canAdminEdit ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Add Task</h4>
            <form action={createTaskFormAction} className="grid gap-3 md:grid-cols-2">
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
              <div className="space-y-1">
                <Label>Annual Goal</Label>
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
                <Label>Quarterly Milestone</Label>
                <Select name="quarterlyMilestoneId" defaultValue="">
                  <option value="">None</option>
                  {milestones.map((milestone) => (
                    <option key={milestone.id} value={milestone.id}>
                      {milestone.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Notes</Label>
                <Textarea name="notes" rows={2} />
              </div>
              <Button type="submit" className="md:col-span-2">
                Add Task
              </Button>
            </form>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
