"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ImageUploadInputProps = {
  name: string;
  defaultValue?: string | null;
  label: string;
  hint?: string;
};

export function ImageUploadInput({ name, defaultValue, label, hint }: ImageUploadInputProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      <input type="hidden" name={name} value={value} readOnly />
      <Input
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;

          if (file.size > 1024 * 1024 * 2) {
            setError("Please upload an image under 2MB.");
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") {
              setValue(result);
              setError(null);
            }
          };
          reader.readAsDataURL(file);
        }}
      />
      {value ? (
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-14 w-14 rounded-md object-cover" />
          <Button type="button" variant="ghost" size="sm" onClick={() => setValue("")}>
            Remove
          </Button>
        </div>
      ) : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
