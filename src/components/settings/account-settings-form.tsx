"use client";

import { useActionState } from "react";

import type { ActionState } from "@/actions/auth-actions";
import { updateAccountBrandingAction } from "@/actions/settings-actions";
import { ImageUploadInput } from "@/components/ui/image-upload-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

type AccountSettingsFormProps = {
  defaultName: string;
  defaultPrimaryColor?: string | null;
  defaultLogoUrl?: string | null;
};

export function AccountSettingsForm({
  defaultName,
  defaultPrimaryColor,
  defaultLogoUrl,
}: AccountSettingsFormProps) {
  const [state, formAction] = useActionState(updateAccountBrandingAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Account Name</Label>
        <Input id="name" name="name" defaultValue={defaultName} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="primaryColor">Primary Color</Label>
        <Input id="primaryColor" name="primaryColor" defaultValue={defaultPrimaryColor ?? ""} placeholder="#1f4f46" />
      </div>

      <ImageUploadInput
        name="logoUrl"
        label="Logo Upload"
        hint="Upload a square logo image. For MVP this is stored directly as a secure data URL."
        defaultValue={defaultLogoUrl}
      />

      {state.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}

      <SubmitButton type="submit">Save Branding</SubmitButton>
    </form>
  );
}
