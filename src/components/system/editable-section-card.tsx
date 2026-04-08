import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SectionField = {
  name: string;
  label: string;
  helper: string;
  value?: string | null;
};

type EditableSectionCardProps = {
  title: string;
  fields: SectionField[];
  isEditMode: boolean;
};

export function EditableSectionCard({ title, fields, isEditMode }: EditableSectionCardProps) {
  return (
    <Card className={isEditMode ? "border-accent-primary/40 bg-[rgba(255,106,0,0.05)]" : undefined}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <p className="text-xs text-text-muted">{field.helper}</p>
            {isEditMode ? (
              <Textarea id={field.name} name={field.name} defaultValue={field.value ?? ""} rows={4} />
            ) : (
              <div className="rounded-md border border-border-subtle bg-surface-2 p-3 text-sm text-text-secondary whitespace-pre-wrap">
                {field.value?.trim() ? field.value : "No content yet."}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
