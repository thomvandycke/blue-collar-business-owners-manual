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
      {state.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
      <SubmitButton type="submit" className="w-full">
        Log In
      </SubmitButton>
      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-[#1f4f46] hover:underline">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-[#1f4f46] hover:underline">
          Create account
        </Link>
      </div>
    </form>
  );
}
