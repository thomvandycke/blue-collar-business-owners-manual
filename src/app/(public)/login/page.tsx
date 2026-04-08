import { LoginForm } from "@/components/auth/login-form";
import { PublicShell } from "@/components/layout/public-shell";

export default function LoginPage() {
  return (
    <PublicShell
      title="Welcome back"
      description="Log in to your operating manual and run your week with clarity."
    >
      <LoginForm />
    </PublicShell>
  );
}
