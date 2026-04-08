import Image from "next/image";
import Link from "next/link";

import { logoutAction } from "@/actions/auth-actions";
import { UserAvatarChip } from "@/components/system/user-avatar-chip";
import { Button } from "@/components/ui/button";

type TopHeaderProps = {
  accountName: string;
  accountLogoUrl?: string | null;
  userName: string;
  userImage?: string | null;
};

export function TopHeader({ accountName, accountLogoUrl, userName, userImage }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        {accountLogoUrl ? (
          <Image
            src={accountLogoUrl}
            alt={`${accountName} logo`}
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1f4f46] text-sm font-bold text-white">
            {accountName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm text-slate-500">Account</p>
          <p className="font-semibold text-slate-900">{accountName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <UserAvatarChip name={userName} imageUrl={userImage} />
        <Button variant="outline" asChild>
          <Link href="/settings/profile">Profile</Link>
        </Button>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost">
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
