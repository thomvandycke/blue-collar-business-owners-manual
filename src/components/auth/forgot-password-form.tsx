"use client";

import { useActionState } from "react";

import { requestPasswordResetAction, type ActionState } from "@/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, initialState);
  const showDevResetLink = process.env.NODE_ENV !== "production";

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      {showDevResetLink && state.resetUrl ? (
        <div className="rounded-md border border-border-subtle bg-surface-2 p-3 text-sm break-all">
          Development reset link:{" "}
          <a className="text-accent-primary underline" href={state.resetUrl}>
            {state.resetUrl}
          </a>
        </div>
      ) : null}
      <SubmitButton type="submit" className="w-full">
        Generate Reset Link
      </SubmitButton>
    </form>
  );
}
