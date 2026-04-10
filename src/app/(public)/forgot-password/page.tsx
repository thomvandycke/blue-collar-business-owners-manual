import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { PublicShell } from "@/components/layout/public-shell";

export default function ForgotPasswordPage() {
  return (
    <PublicShell
      title="Reset your password"
      description="Enter your email and we will send a secure reset link."
    >
      <ForgotPasswordForm />
    </PublicShell>
  );
}
