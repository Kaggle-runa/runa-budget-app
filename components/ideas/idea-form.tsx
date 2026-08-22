"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/layout/glass-card";
import { submitIdeaAction } from "@/lib/actions/ideas";

const initialState = { error: undefined as string | undefined, ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? "送信中..." : "企画を送る"}
    </Button>
  );
}

export function IdeaForm() {
  const [state, action] = useFormState(submitIdeaAction, initialState);

  return (
    <GlassCard className="p-5">
      <h2 className="text-lg font-semibold text-secondary">企画を送る</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">
        ご飯代になりそうな企画を教えてね。採用したら取引明細にも載せるよ。データ分析とかKaggleっぽいのも大歓迎！
      </p>
      {state.ok ? (
        <p className="rounded-xl bg-green-100 px-3 py-2 text-sm text-green-800">
          届いたよ。僕がじっくり読むね。
        </p>
      ) : (
        <form action={action} className="space-y-4">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
          />
          <div className="space-y-1.5">
            <Label htmlFor="displayName">お名前（任意）</Label>
            <Input id="displayName" name="displayName" placeholder="匿名でもOK" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">企画タイトル</Label>
            <Input id="title" name="title" required placeholder="例: Kaggleコンペ実況" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">内容</Label>
            <Textarea
              id="body"
              name="body"
              required
              minLength={10}
              placeholder="どんなお仕事？ ご飯代はどれくらい使いそう？ 君と一緒にできそう？"
              className="min-h-28"
            />
          </div>
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <SubmitButton />
        </form>
      )}
    </GlassCard>
  );
}
