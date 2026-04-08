import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function HomePage() {
  const authContext = await getCurrentUser();

  if (authContext) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-10">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 pt-10 text-center">
        <Image
          src="/brand/logo-text-orange-navy.png"
          alt="Unmatched Growth"
          width={380}
          height={100}
          className="h-auto w-full max-w-[380px] object-contain"
          priority
        />
        <h1 className="text-3xl font-semibold text-text-primary">Blue Collar Business Owner&apos;s Manual</h1>
        <p className="max-w-2xl text-sm text-text-secondary">
          A calm operating system for managing your 8 core business systems with clarity, ownership, and traction.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>
        <Card className="w-full max-w-2xl">
          <CardContent className="p-5 text-left text-sm text-text-secondary">
            <p className="font-semibold text-text-primary">Built for real operators, not bloated project software.</p>
            <p className="mt-2">
              Keep strategy and execution connected through GRIT: Game Plan, Rigging, Indicators, and Traction.
            </p>
          </CardContent>
        </Card>
        <p className="text-xs text-text-muted">© 2026 Unmatched Growth</p>
      </div>
    </main>
  );
}
