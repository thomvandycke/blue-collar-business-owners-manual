import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function ProfileSettingsPage() {
  const authContext = await requireUser();

  const user = await prisma.user.findUnique({ where: { id: authContext.user.id } });

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <p className="text-sm text-text-muted">Manage your display name, profile image, and password.</p>
      </CardHeader>
      <CardContent>
        <ProfileSettingsForm
          defaultDisplayName={user.displayName}
          defaultProfileImage={user.profileImageUrl}
        />
      </CardContent>
    </Card>
  );
}
