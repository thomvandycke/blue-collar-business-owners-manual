import { InviteStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import { PublicShell } from "@/components/layout/public-shell";
import { prisma } from "@/lib/prisma";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await prisma.userInvite.findUnique({ where: { token } });

  if (!invite || invite.status !== InviteStatus.PENDING) {
    notFound();
  }

  return (
    <PublicShell
      title="Accept invite"
      description="Create your login to join your business account."
    >
      <AcceptInviteForm token={invite.token} email={invite.email} />
    </PublicShell>
  );
}
