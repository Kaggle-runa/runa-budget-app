"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { importKyoteiCsvAction } from "@/lib/actions/races";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "取り込み中..." : "CSVを取り込む"}
    </Button>
  );
}

export function RaceCsvForm() {
  const [state, action] = useActionState(importKyoteiCsvAction, {});

  return (
    <form action={action} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        テレボートの投票履歴 CSV（TVOT020）です。文字コードは CP932 と UTF-8 のどちらでも読めます。同じ買い目は増えません。
      </p>
      <input
        type="file"
        name="file"
        accept=".csv,text/csv"
        required
        className="block w-full text-sm"
      />
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-teal-700">{state.message}</p> : null}
      <SubmitButton />
    </form>
  );
}
