import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const authContext = await getCurrentUser();

  if (authContext) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
