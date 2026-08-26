"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { refreshNumeraiAction } from "@/lib/actions/numerai";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "取得中..." : "いま取り直す"}
    </Button>
  );
}

export function NumeraiRefreshForm({
  lastFetchedAt,
}: {
  lastFetchedAt: string | null;
}) {
  const [state, action] = useActionState(refreshNumeraiAction, {});
  const fetchedAt = state.fetchedAt ?? lastFetchedAt;

  return (
    <form action={action} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        公開サイトの Numerai / NMR 円は1時間キャッシュです。ここから取り直すと、トップ・収支・観察ページが更新されます。
      </p>
      <p className="text-sm text-zinc-700">
        前回の取得: {fetchedAt ? fetchedAt.replace("T", " ").slice(0, 19) : "まだありません"}
      </p>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-teal-700">取得できました。</p> : null}
      <SubmitButton />
    </form>
  );
}
