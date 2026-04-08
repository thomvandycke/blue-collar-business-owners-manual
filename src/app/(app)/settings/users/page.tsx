import { InviteStatus, UserRole } from "@prisma/client";

import { cancelInviteAction, toggleUserActiveAction } from "@/actions/settings-actions";
import { InviteUserForm } from "@/components/settings/invite-user-form";
import { UserAvatarChip } from "@/components/system/user-avatar-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function UsersSettingsPage() {
  const authContext = await requireUser();

  if (authContext.user.role !== UserRole.ADMIN) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">Only admins can manage users and invites.</p>
        </CardContent>
      </Card>
    );
  }

  const [users, invites] = await Promise.all([
    prisma.user.findMany({
      where: {
        accountId: authContext.account.id,
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    }),
    prisma.userInvite.findMany({
      where: {
        accountId: authContext.account.id,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Team Seats</CardTitle>
          <p className="text-sm text-text-muted">
            Base plan supports up to {authContext.account.maxUsers} active users.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-lg border border-border-subtle p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <UserAvatarChip name={user.displayName} imageUrl={user.profileImageUrl} />
                  <p className="text-sm text-text-secondary">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={user.role === UserRole.ADMIN ? "default" : "muted"}>
                    {user.role.toLowerCase()}
                  </Badge>
                  <Badge tone={user.isActive ? "success" : "warning"}>
                    {user.isActive ? "active" : "inactive"}
                  </Badge>
                </div>
              </div>
              {user.id !== authContext.user.id ? (
                <form action={toggleUserActiveAction} className="mt-2">
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="setActive" value={user.isActive ? "false" : "true"} />
                  <Button type="submit" size="sm" variant="outline">
                    {user.isActive ? "Deactivate" : "Reactivate"}
                  </Button>
                </form>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <InviteUserForm />

      <Card>
        <CardHeader>
          <CardTitle>Invite History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {invites.length === 0 ? (
            <p className="text-sm text-text-muted">No invites yet.</p>
          ) : (
            invites.map((invite) => (
              <div key={invite.id} className="rounded-lg border border-border-subtle p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-text-primary">{invite.email}</p>
                    <p className="text-sm text-text-muted">
                      {invite.role.toLowerCase()} • created {formatDate(invite.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={invite.status === InviteStatus.PENDING ? "warning" : "muted"}>
                      {invite.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
                {invite.status === InviteStatus.PENDING ? (
                  <form action={cancelInviteAction} className="mt-2">
                    <input type="hidden" name="inviteId" value={invite.id} />
                    <Button type="submit" size="sm" variant="ghost" className="text-danger hover:bg-[rgba(235,87,87,0.2)]">
                      Cancel Invite
                    </Button>
                  </form>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
