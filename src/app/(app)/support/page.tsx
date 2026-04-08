import { SupportRequestForm } from "@/components/support/support-request-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";

export default async function SupportPage() {
  await requireUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Help & Feature Requests</CardTitle>
        <p className="text-sm text-text-muted">
          Send questions, bug reports, or feature ideas directly to the Unmatched Growth team.
        </p>
      </CardHeader>
      <CardContent>
        <SupportRequestForm />
      </CardContent>
    </Card>
  );
}

