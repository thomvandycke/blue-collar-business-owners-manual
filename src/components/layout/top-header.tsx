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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border-subtle bg-bg-primary/95 px-6 backdrop-blur">
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
          <Image
            src="/brand/logo-mark-orange-trans-bg.png"
            alt="Unmatched Growth mark"
            width={40}
            height={40}
            className="h-10 w-10 rounded-md object-cover"
          />
        )}
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted">Account</p>
          <p className="font-semibold text-text-primary">{accountName}</p>
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
