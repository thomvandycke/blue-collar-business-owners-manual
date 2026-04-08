import { UserRole } from "@prisma/client";

import { AccountSettingsForm } from "@/components/settings/account-settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function AccountSettingsPage() {
  const authContext = await requireUser();

  if (authContext.user.role !== UserRole.ADMIN) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Only admins can edit account branding and settings.</p>
        </CardContent>
      </Card>
    );
  }

  const account = await prisma.account.findUnique({ where: { id: authContext.account.id } });

  if (!account) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <p className="text-sm text-slate-500">Update branding used across dashboard and one-page summaries.</p>
      </CardHeader>
      <CardContent>
        <AccountSettingsForm
          defaultName={account.name}
          defaultPrimaryColor={account.primaryColor}
          defaultLogoUrl={account.logoUrl}
        />
      </CardContent>
    </Card>
  );
}
