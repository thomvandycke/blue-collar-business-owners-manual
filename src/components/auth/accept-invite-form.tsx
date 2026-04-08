"use client";

import { useActionState } from "react";

import { acceptInviteAction, type ActionState } from "@/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

type AcceptInviteFormProps = {
  token: string;
  email: string;
};

export function AcceptInviteForm({ token, email }: AcceptInviteFormProps) {
  const [state, formAction] = useActionState(acceptInviteAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
        Invited email: <strong>{email}</strong>
      </div>
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input id="displayName" name="displayName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Create Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {state.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
      <SubmitButton type="submit" className="w-full">
        Accept Invite
      </SubmitButton>
    </form>
  );
}
