import { SignupForm } from "@/components/auth/signup-form";
import { PublicShell } from "@/components/layout/public-shell";

export default function SignupPage() {
  return (
    <PublicShell
      title="Create your account"
      description="Set up your business workspace and start with all 8 systems ready to go."
    >
      <SignupForm />
    </PublicShell>
  );
}
