import { ItemStatus, PriorityLevel, type AnnualGoal } from "@prisma/client";

import {
  createAnnualGoalFormAction,
  deleteAnnualGoalAction,
  updateAnnualGoalFormAction,
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

type AnnualGoalWithOwner = AnnualGoal & {
  owner: UserOption | null;
};

type AnnualGoalListProps = {
  systemId: string;
  goals: AnnualGoalWithOwner[];
  users: UserOption[];
  isEditMode: boolean;
  canEdit: boolean;
};

const statuses = [ItemStatus.NOT_STARTED, ItemStatus.IN_PROGRESS, ItemStatus.BLOCKED, ItemStatus.COMPLETE];
const priorities = [PriorityLevel.LOW, PriorityLevel.MEDIUM, PriorityLevel.HIGH, PriorityLevel.CRITICAL];

export function AnnualGoalList({ systemId, goals, users, isEditMode, canEdit }: AnnualGoalListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Annual Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-500">
            No annual goals yet.
          </p>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="rounded-lg border border-slate-200 p-4">
              {isEditMode && canEdit ? (
                <form action={updateAnnualGoalFormAction} className="space-y-3">
                  <input type="hidden" name="id" defaultValue={goal.id} />
                  <input type="hidden" name="systemId" defaultValue={systemId} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1 md:col-span-2">
                      <Label>Title</Label>
                      <Input name="title" defaultValue={goal.title} required />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea name="description" defaultValue={goal.description ?? ""} rows={3} />
                    </div>
                    <div className="space-y-1">
                      <Label>Status</Label>
                      <Select name="status" defaultValue={goal.status}>
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.toLowerCase()}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Priority</Label>
                      <Select name="priority" defaultValue={goal.priority}>
                        {priorities.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority.toLowerCase()}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Owner</Label>
                      <Select name="ownerUserId" defaultValue={goal.ownerUserId ?? ""}>
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
                        defaultValue={goal.dueDate ? goal.dueDate.toISOString().slice(0, 10) : ""}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label>Notes</Label>
                      <Textarea name="notes" defaultValue={goal.notes ?? ""} rows={2} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" type="submit">
                      Save Goal
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-medium text-slate-900">{goal.title}</h4>
                    <div className="flex gap-2">
                      <ItemStatusBadge status={goal.status} />
                      <PriorityBadge priority={goal.priority} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{goal.description || "No description"}</p>
                  <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <span>Due: {formatDate(goal.dueDate)}</span>
                    <span>Notes: {goal.notes || "-"}</span>
                  </div>
                  <UserAvatarChip name={goal.owner?.displayName} imageUrl={goal.owner?.profileImageUrl} />
                </div>
              )}
              {isEditMode && canEdit ? (
                <form action={deleteAnnualGoalAction} className="mt-3">
                  <input type="hidden" name="id" defaultValue={goal.id} />
                  <input type="hidden" name="systemId" defaultValue={systemId} />
                  <Button type="submit" size="sm" variant="ghost" className="text-rose-700 hover:bg-rose-50">
                    Delete Goal
                  </Button>
                </form>
              ) : null}
            </div>
          ))
        )}

        {isEditMode && canEdit ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Add Annual Goal</h4>
            <form action={createAnnualGoalFormAction} className="grid gap-3 md:grid-cols-2">
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
              <div className="space-y-1 md:col-span-2">
                <Label>Notes</Label>
                <Textarea name="notes" rows={2} />
              </div>
              <Button type="submit" className="md:col-span-2">
                Add Annual Goal
              </Button>
            </form>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
