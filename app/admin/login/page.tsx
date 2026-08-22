"use client";

import { useFormState, useFormStatus } from "react-dom";
import { GlassCard } from "@/components/layout/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/actions/auth";
import { SITE } from "@/lib/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "確認中..." : "ログイン"}
    </Button>
  );
}

export default function AdminLoginPage() {
  const [state, action] = useFormState(loginAction, {});

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <GlassCard className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-secondary">運営ログイン</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          {SITE.name} の収支と予定を更新します。
        </p>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <SubmitButton />
        </form>
      </GlassCard>
    </div>
  );
}
