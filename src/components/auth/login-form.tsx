"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, type ActionState } from "@/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
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
      <div className="rounded-lg border border-border-subtle bg-surface-2 p-3 text-xs text-text-muted">
        <p className="font-semibold uppercase tracking-wide text-text-secondary">Privacy + Terms Notice</p>
        <p className="mt-2">
          This platform stores business planning data, account information, and login/session records to provide core
          functionality, security, and support. We do not sell your personal information. Access is role-based and
          activity may be logged for accountability and audit history.
        </p>
        <p className="mt-2">
          By logging in, you agree to our{" "}
          <Link href="/terms" className="text-accent-primary hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          and acknowledge our{" "}
          <Link href="/privacy" className="text-accent-primary hover:underline">
            Privacy Statement
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
