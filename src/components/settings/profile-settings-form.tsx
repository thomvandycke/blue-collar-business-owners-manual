"use client";

import { useActionState } from "react";

import { changePasswordAction, type ActionState } from "@/actions/auth-actions";
import { updateProfileAction } from "@/actions/settings-actions";
import { ImageUploadInput } from "@/components/ui/image-upload-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

type ProfileSettingsFormProps = {
  defaultDisplayName: string;
  defaultProfileImage?: string | null;
};

export function ProfileSettingsForm({ defaultDisplayName, defaultProfileImage }: ProfileSettingsFormProps) {
  const [profileState, profileAction] = useActionState(updateProfileAction, initialState);
  const [passwordState, passwordAction] = useActionState(changePasswordAction, initialState);

  return (
    <div className="space-y-8">
      <form action={profileAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input id="displayName" name="displayName" defaultValue={defaultDisplayName} required />
        </div>

        <ImageUploadInput
          name="profileImageUrl"
          label="Profile Image"
          hint="Upload a profile photo under 2MB."
          defaultValue={defaultProfileImage}
        />

        {profileState.error ? <p className="text-sm text-danger">{profileState.error}</p> : null}
        {profileState.success ? <p className="text-sm text-success">{profileState.success}</p> : null}

        <SubmitButton type="submit">Save Profile</SubmitButton>
      </form>

      <form action={passwordAction} className="space-y-4 rounded-lg border border-border-subtle p-4">
        <h3 className="text-base font-semibold text-text-primary">Change Password</h3>
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input id="currentPassword" name="currentPassword" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input id="newPassword" name="newPassword" type="password" required />
          <p className="text-xs text-text-muted">Use at least 8 characters with uppercase, lowercase, and a number.</p>
        </div>

        {passwordState.error ? <p className="text-sm text-danger">{passwordState.error}</p> : null}
        {passwordState.success ? <p className="text-sm text-success">{passwordState.success}</p> : null}

        <SubmitButton type="submit">Update Password</SubmitButton>
      </form>
    </div>
  );
}
