import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { PublicShell } from "@/components/layout/public-shell";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <PublicShell
      title="Set a new password"
      description="Use a strong password to keep your account secure."
    >
      <ResetPasswordForm token={token} />
    </PublicShell>
  );
}
