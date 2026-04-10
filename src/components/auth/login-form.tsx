"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, type ActionState } from "@/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

type LoginFormProps = {
  resetNotice?: string;
};

export function LoginForm({ resetNotice }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {resetNotice ? <p className="text-sm text-success">{resetNotice}</p> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          name="rememberMe"
          className="h-4 w-4 rounded border-border-subtle bg-surface-2 accent-accent-primary"
        />
        Remember me
      </label>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <SubmitButton type="submit" className="w-full">
        Log In
      </SubmitButton>
      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-accent-primary hover:underline">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-accent-primary hover:underline">
          Create account
        </Link>
      </div>
      <div className="rounded-md border border-border-subtle bg-bg-secondary p-2 text-xs leading-relaxed text-text-muted">
        By logging in, you agree to our{" "}
        <Link href="/terms" className="font-semibold text-accent-primary underline underline-offset-2">
          Terms &amp; Conditions
        </Link>{" "}
        and acknowledge our{" "}
        <Link href="/privacy" className="font-semibold text-accent-primary underline underline-offset-2">
          Privacy Statement
        </Link>
        .
      </div>
    </form>
  );
}
