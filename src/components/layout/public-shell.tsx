import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

type PublicShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function PublicShell({ title, description, children }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-bg-primary px-4 py-10">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center justify-center gap-3 text-center">
          <Image
            src="/brand/logo-mark-orange-trans-bg.png"
            alt="Unmatched Growth mark"
            width={30}
            height={30}
            className="h-8 w-8 object-contain"
          />
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Blue Collar Business Owner&apos;s Manual</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-text-muted">{description}</p>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
        <p className="text-center text-xs text-text-muted">© 2026 Unmatched Growth</p>
      </div>
    </div>
  );
}
