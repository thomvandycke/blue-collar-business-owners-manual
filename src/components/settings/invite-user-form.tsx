"use client";

import { UserRole } from "@prisma/client";
import { useActionState } from "react";

import type { ActionState } from "@/actions/auth-actions";
import { inviteUserAction } from "@/actions/settings-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function InviteUserForm() {
  const [state, formAction] = useActionState(inviteUserAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border-subtle p-4">
      <h3 className="text-base font-semibold text-text-primary">Invite User</h3>
      <div className="space-y-2">
        <Label htmlFor="inviteEmail">Email</Label>
        <Input id="inviteEmail" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inviteRole">Role</Label>
        <Select id="inviteRole" name="role" defaultValue={UserRole.MEMBER}>
          <option value={UserRole.MEMBER}>Member</option>
          <option value={UserRole.ADMIN}>Admin</option>
        </Select>
      </div>

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      {state.resetUrl ? (
        <div className="rounded-md border border-border-subtle bg-surface-2 p-3 text-sm break-all">
          Invite link: <a className="text-accent-primary underline" href={state.resetUrl}>{state.resetUrl}</a>
        </div>
      ) : null}

      <SubmitButton type="submit">Create Invite</SubmitButton>
    </form>
  );
}
