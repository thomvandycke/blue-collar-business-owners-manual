import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WidgetCardProps = {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
};

export function WidgetCard({ title, subtitle, children }: WidgetCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle ? <p className="text-sm text-text-muted">{subtitle}</p> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
