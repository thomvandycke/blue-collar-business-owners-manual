import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PublicShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function PublicShell({ title, description, children }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e7f3ef,_#f7faf9_45%,_#ffffff_85%)] px-4 py-10">
      <div className="mx-auto max-w-md space-y-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1f4f46]">Blue Collar Business Owner&apos;s Manual</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-slate-500">{description}</p>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
