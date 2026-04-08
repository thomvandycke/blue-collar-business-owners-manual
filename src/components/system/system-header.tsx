import Link from "next/link";

import { SystemName, type User } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatarChip } from "@/components/system/user-avatar-chip";
import { formatDate } from "@/lib/utils";
import { getSystemByName } from "@/lib/system-config";

type SystemHeaderProps = {
  systemName: SystemName;
  owner: Pick<User, "displayName" | "profileImageUrl"> | null;
  updatedAt: Date;
  isEditMode: boolean;
  canEdit: boolean;
};

export function SystemHeader({ systemName, owner, updatedAt, isEditMode, canEdit }: SystemHeaderProps) {
  const definition = getSystemByName(systemName);
  const systemSlug = definition?.slug ?? "";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">{definition?.label ?? systemName}</h1>
          <Badge tone={isEditMode ? "warning" : "muted"}>{isEditMode ? "Edit Mode" : "View Mode"}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <UserAvatarChip name={owner?.displayName} imageUrl={owner?.profileImageUrl} />
          <span>Last updated: {formatDate(updatedAt)}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`/systems/${systemSlug}/summary`}>Summary</Link>
        </Button>
        {canEdit ? (
          <Button variant={isEditMode ? "secondary" : "default"} asChild>
            <Link href={isEditMode ? `/systems/${systemSlug}` : `/systems/${systemSlug}?mode=edit`}>
              {isEditMode ? "Switch to View" : "Switch to Edit"}
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
