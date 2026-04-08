"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signupAction, type ActionState } from "@/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="accountName">Business Name</Label>
        <Input id="accountName" name="accountName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="displayName">Your Name</Label>
        <Input id="displayName" name="displayName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
        <p className="text-xs text-text-muted">Use at least 8 characters with uppercase, lowercase, and a number.</p>
      </div>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <SubmitButton type="submit" className="w-full">
        Create Account
      </SubmitButton>
      <p className="text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
