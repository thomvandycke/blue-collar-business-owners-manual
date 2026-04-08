import { KPIType, UpdateFrequency, type KPI } from "@prisma/client";

import {
  createKpiFormAction,
  deleteKpiAction,
  updateKpiFormAction,
} from "@/actions/system-actions";
import { UserAvatarChip } from "@/components/system/user-avatar-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type UserOption = {
  id: string;
  displayName: string;
  profileImageUrl: string | null;
};

type KPIWithOwner = KPI & {
  owner: UserOption | null;
};

type KpiTableProps = {
  systemId: string;
  kpis: KPIWithOwner[];
  users: UserOption[];
  isEditMode: boolean;
  canEdit: boolean;
};

const frequencies = [
  UpdateFrequency.WEEKLY,
  UpdateFrequency.MONTHLY,
  UpdateFrequency.QUARTERLY,
  UpdateFrequency.ANNUALLY,
];

export function KpiTable({ systemId, kpis, users, isEditMode, canEdit }: KpiTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicators (KPIs)</CardTitle>
        <p className="text-sm text-text-muted">Track up to 5 active indicators for this system.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          {kpis.length === 0 ? (
            <p className="rounded-md border border-dashed border-border-subtle p-3 text-sm text-text-muted">
              No KPIs yet.
            </p>
          ) : (
            kpis.map((kpi) => (
              <div key={kpi.id} className="rounded-lg border border-border-subtle p-4">
                {isEditMode && canEdit ? (
                  <form action={updateKpiFormAction} className="space-y-3">
                    <input type="hidden" name="id" defaultValue={kpi.id} />
                    <input type="hidden" name="systemId" defaultValue={systemId} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Name</Label>
                        <Input name="name" defaultValue={kpi.name} required />
                      </div>
                      <div className="space-y-1">
                        <Label>Owner</Label>
                        <Select name="ownerUserId" defaultValue={kpi.ownerUserId ?? ""}>
                          <option value="">Unassigned</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.displayName}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Type</Label>
                        <Select name="type" defaultValue={kpi.type}>
                          <option value={KPIType.LEADING}>Leading</option>
                          <option value={KPIType.LAGGING}>Lagging</option>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Update Frequency</Label>
                        <Select name="updateFrequency" defaultValue={kpi.updateFrequency ?? ""}>
                          <option value="">Not set</option>
                          {frequencies.map((frequency) => (
                            <option key={frequency} value={frequency}>
                              {frequency.toLowerCase()}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Target</Label>
                        <Input name="targetValue" type="number" step="0.01" defaultValue={kpi.targetValue?.toString() ?? ""} />
                      </div>
                      <div className="space-y-1">
                        <Label>Current</Label>
                        <Input name="currentValue" type="number" step="0.01" defaultValue={kpi.currentValue?.toString() ?? ""} />
                      </div>
                      <div className="space-y-1">
                        <Label>Unit</Label>
                        <Input name="unit" defaultValue={kpi.unit ?? ""} placeholder="%, USD, leads" />
                      </div>
                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Input name="description" defaultValue={kpi.description ?? ""} />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary">
                      <input type="checkbox" name="isActive" defaultChecked={kpi.isActive} />
                      Active KPI
                    </label>
                    <div className="flex gap-2">
                      <Button size="sm" type="submit">
                        Save KPI
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-text-primary">{kpi.name}</h4>
                        <p className="text-xs text-text-muted">{kpi.description || "No description"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={kpi.type === KPIType.LEADING ? "success" : "muted"}>{kpi.type.toLowerCase()}</Badge>
                        <Badge tone={kpi.isActive ? "default" : "warning"}>
                          {kpi.isActive ? "active" : "inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm text-text-secondary md:grid-cols-4">
                      <span>Target: {kpi.targetValue?.toString() ?? "-"}</span>
                      <span>Current: {kpi.currentValue?.toString() ?? "-"}</span>
                      <span>Unit: {kpi.unit ?? "-"}</span>
                      <span>Frequency: {kpi.updateFrequency?.toLowerCase() ?? "-"}</span>
                    </div>
                    <UserAvatarChip name={kpi.owner?.displayName} imageUrl={kpi.owner?.profileImageUrl} />
                  </div>
                )}
                {isEditMode && canEdit ? (
                  <form action={deleteKpiAction} className="mt-3">
                    <input type="hidden" name="id" defaultValue={kpi.id} />
                    <input type="hidden" name="systemId" defaultValue={systemId} />
                    <Button type="submit" size="sm" variant="ghost" className="text-danger hover:bg-[rgba(235,87,87,0.2)]">
                      Delete KPI
                    </Button>
                  </form>
                ) : null}
              </div>
            ))
          )}
        </div>

        {isEditMode && canEdit ? (
          <div className="rounded-lg border border-dashed border-border-subtle p-4">
            <h4 className="mb-3 text-sm font-semibold text-text-primary">Add KPI</h4>
            <form action={createKpiFormAction} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="systemId" defaultValue={systemId} />
              <div className="space-y-1 md:col-span-2">
                <Label>Name</Label>
                <Input name="name" placeholder="Example: Quote Conversion Rate" required />
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
                <Label>Type</Label>
                <Select name="type" defaultValue={KPIType.LEADING}>
                  <option value={KPIType.LEADING}>Leading</option>
                  <option value={KPIType.LAGGING}>Lagging</option>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Target</Label>
                <Input name="targetValue" type="number" step="0.01" />
              </div>
              <div className="space-y-1">
                <Label>Current</Label>
                <Input name="currentValue" type="number" step="0.01" />
              </div>
              <div className="space-y-1">
                <Label>Unit</Label>
                <Input name="unit" placeholder="%, $, jobs" />
              </div>
              <div className="space-y-1">
                <Label>Update Frequency</Label>
                <Select name="updateFrequency" defaultValue={UpdateFrequency.WEEKLY}>
                  {frequencies.map((frequency) => (
                    <option key={frequency} value={frequency}>
                      {frequency.toLowerCase()}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Description</Label>
                <Input name="description" />
              </div>
              <label className="flex items-center gap-2 text-sm text-text-secondary md:col-span-2">
                <input type="checkbox" name="isActive" defaultChecked />
                Active KPI
              </label>
              <Button type="submit" className="md:col-span-2">
                Add KPI
              </Button>
            </form>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
