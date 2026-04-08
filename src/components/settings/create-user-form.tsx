"use client";

import { UserRole } from "@prisma/client";
import { useActionState } from "react";

import type { ActionState } from "@/actions/auth-actions";
import { createUserDirectAction } from "@/actions/settings-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function CreateUserForm() {
  const [state, formAction] = useActionState(createUserDirectAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border-subtle p-4">
      <h3 className="text-base font-semibold text-text-primary">Add User Directly</h3>
      <p className="text-sm text-text-muted">
        Create a user immediately with login credentials (no invite link required).
      </p>
      <div className="space-y-2">
        <Label htmlFor="directDisplayName">Display Name</Label>
        <Input id="directDisplayName" name="displayName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="directEmail">Email</Label>
        <Input id="directEmail" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="directPassword">Temporary Password</Label>
        <Input id="directPassword" name="password" type="password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="directRole">Role</Label>
        <Select id="directRole" name="role" defaultValue={UserRole.MEMBER}>
          <option value={UserRole.MEMBER}>Member</option>
          <option value={UserRole.ADMIN}>Admin</option>
        </Select>
      </div>

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <SubmitButton type="submit">Create User</SubmitButton>
    </form>
  );
}

