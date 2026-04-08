import Link from "next/link";

import { type SystemName } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSystemByName } from "@/lib/system-config";

type SystemHealthCardProps = {
  systemName: SystemName;
  ownerName?: string | null;
  kpiCount: number;
  openTasks: number;
  overdueTasks: number;
  completion: number;
};

export function SystemHealthCard({
  systemName,
  ownerName,
  kpiCount,
  openTasks,
  overdueTasks,
  completion,
}: SystemHealthCardProps) {
  const system = getSystemByName(systemName);

  return (
    <Card className="border-slate-200">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{system?.label ?? systemName}</h3>
          <p className="text-sm text-slate-500">Owner: {ownerName || "Unassigned"}</p>
        </div>
        <Badge tone={completion >= 75 ? "success" : completion >= 40 ? "warning" : "muted"}>
          {completion}% complete
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Active KPIs</span>
          <span className="font-medium text-slate-900">{kpiCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Open Tasks</span>
          <span className="font-medium text-slate-900">{openTasks}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Overdue</span>
          <span className="font-medium text-rose-700">{overdueTasks}</span>
        </div>
        <Link href={`/systems/${system?.slug}`} className="inline-block pt-1 text-[#1f4f46] hover:underline">
          Open system
        </Link>
      </CardContent>
    </Card>
  );
}
