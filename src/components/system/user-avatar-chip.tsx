import Image from "next/image";

import { cn } from "@/lib/utils";

type UserAvatarChipProps = {
  name?: string | null;
  imageUrl?: string | null;
  className?: string;
};

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function UserAvatarChip({ name, imageUrl, className }: UserAvatarChipProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="relative h-7 w-7 overflow-hidden rounded-full bg-surface-3 text-[11px] font-semibold text-text-secondary">
        {imageUrl ? (
          <Image src={imageUrl} alt={name ?? "User"} fill unoptimized className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">{initials(name)}</div>
        )}
      </div>
      <span className="text-sm text-text-secondary">{name ?? "Unassigned"}</span>
    </div>
  );
}
