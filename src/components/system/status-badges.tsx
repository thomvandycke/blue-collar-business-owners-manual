import { ItemStatus, PriorityLevel } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

export function ItemStatusBadge({ status }: { status: ItemStatus }) {
  if (status === ItemStatus.COMPLETE) return <Badge tone="success">complete</Badge>;
  if (status === ItemStatus.BLOCKED) return <Badge tone="danger">blocked</Badge>;
  if (status === ItemStatus.IN_PROGRESS) return <Badge tone="warning">in progress</Badge>;
  return <Badge tone="muted">not started</Badge>;
}

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  if (priority === PriorityLevel.CRITICAL) return <Badge tone="danger">critical</Badge>;
  if (priority === PriorityLevel.HIGH) return <Badge tone="warning">high</Badge>;
  if (priority === PriorityLevel.MEDIUM) return <Badge tone="default">medium</Badge>;
  return <Badge tone="muted">low</Badge>;
}
