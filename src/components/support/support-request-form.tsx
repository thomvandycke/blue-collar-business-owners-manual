"use client";

import { useActionState } from "react";

import type { ActionState } from "@/actions/auth-actions";
import { submitSupportRequestAction } from "@/actions/support-actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function SupportRequestForm() {
  const [state, formAction] = useActionState(submitSupportRequestAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Input id="topic" name="topic" placeholder="Short summary of your request" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select id="category" name="category" defaultValue="help">
          <option value="help">Help</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Suggestion</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={8} placeholder="Share context, goal, and what happened." required />
      </div>

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <SubmitButton type="submit">Send Request</SubmitButton>
    </form>
  );
}

