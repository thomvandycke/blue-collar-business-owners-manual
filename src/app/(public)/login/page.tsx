import { LoginForm } from "@/components/auth/login-form";
import { PublicShell } from "@/components/layout/public-shell";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const params = await searchParams;
  const resetNotice =
    params.reset === "success"
      ? "Password reset complete. Please log in with your new password."
      : undefined;

  return (
    <PublicShell
      title="Welcome back"
      description="Log in to your operating manual and run your week with clarity."
    >
      <LoginForm resetNotice={resetNotice} />
    </PublicShell>
  );
}
