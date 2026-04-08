import { ItemStatus, PriorityLevel, type PriorityItem } from "@prisma/client";

import {
  createPriorityFormAction,
  deletePriorityAction,
  updatePriorityFormAction,
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

type PriorityWithOwner = PriorityItem & {
  owner: UserOption | null;
};

type PriorityListProps = {
  systemId: string;
  items: PriorityWithOwner[];
  users: UserOption[];
  isEditMode: boolean;
  canEdit: boolean;
};

const statuses = [ItemStatus.NOT_STARTED, ItemStatus.IN_PROGRESS, ItemStatus.BLOCKED, ItemStatus.COMPLETE];
const priorities = [PriorityLevel.LOW, PriorityLevel.MEDIUM, PriorityLevel.HIGH, PriorityLevel.CRITICAL];

export function PriorityList({ systemId, items, users, isEditMode, canEdit }: PriorityListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Priorities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed border-border-subtle p-3 text-sm text-text-muted">
            No priority items yet.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border-subtle p-4">
              {isEditMode && canEdit ? (
                <form action={updatePriorityFormAction} className="space-y-3">
                  <input type="hidden" name="id" defaultValue={item.id} />
                  <input type="hidden" name="systemId" defaultValue={systemId} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1 md:col-span-2">
                      <Label>Title</Label>
                      <Input name="title" defaultValue={item.title} required />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea name="description" defaultValue={item.description ?? ""} rows={2} />
                    </div>
                    <div className="space-y-1">
                      <Label>Status</Label>
                      <Select name="status" defaultValue={item.status}>
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.toLowerCase()}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Priority</Label>
                      <Select name="priority" defaultValue={item.priority}>
                        {priorities.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority.toLowerCase()}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Owner</Label>
                      <Select name="ownerUserId" defaultValue={item.ownerUserId ?? ""}>
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
                        defaultValue={item.dueDate ? item.dueDate.toISOString().slice(0, 10) : ""}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label>Notes</Label>
                      <Textarea name="notes" defaultValue={item.notes ?? ""} rows={2} />
                    </div>
                  </div>
                  <Button size="sm" type="submit">
                    Save Priority
                  </Button>
                </form>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-medium text-text-primary">{item.title}</h4>
                    <div className="flex gap-2">
                      <ItemStatusBadge status={item.status} />
                      <PriorityBadge priority={item.priority} />
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary">{item.description || "No description"}</p>
                  <div className="grid gap-2 text-sm text-text-secondary md:grid-cols-2">
                    <span>Due: {formatDate(item.dueDate)}</span>
                    <span>Notes: {item.notes || "-"}</span>
                  </div>
                  <UserAvatarChip name={item.owner?.displayName} imageUrl={item.owner?.profileImageUrl} />
                </div>
              )}
              {isEditMode && canEdit ? (
                <form action={deletePriorityAction} className="mt-3">
                  <input type="hidden" name="id" defaultValue={item.id} />
                  <input type="hidden" name="systemId" defaultValue={systemId} />
                  <Button type="submit" size="sm" variant="ghost" className="text-danger hover:bg-[rgba(235,87,87,0.2)]">
                    Delete Priority
                  </Button>
                </form>
              ) : null}
            </div>
          ))
        )}

        {isEditMode && canEdit ? (
          <div className="rounded-lg border border-dashed border-border-subtle p-4">
            <h4 className="mb-3 text-sm font-semibold text-text-primary">Add Priority</h4>
            <form action={createPriorityFormAction} className="grid gap-3 md:grid-cols-2">
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
                <Select name="priority" defaultValue={PriorityLevel.HIGH}>
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
                Add Priority
              </Button>
            </form>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
