"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TX_TYPES, categoriesForType } from "@/lib/categories";
import { upsertTransactionAction } from "@/lib/actions/transactions";
import type { ProjectDTO, TransactionDTO, TxType } from "@/types/domain";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "保存中..." : editing ? "更新する" : "追加する"}
    </Button>
  );
}

export function TransactionForm({
  projects,
  initial,
}: {
  projects: ProjectDTO[];
  initial?: TransactionDTO;
}) {
  const [type, setType] = useState<TxType>(initial?.type ?? "income");
  const categories = useMemo(() => categoriesForType(type), [type]);
  const [state, action] = useFormState(upsertTransactionAction, {});

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="space-y-1.5">
        <Label htmlFor="date">日付</Label>
        <Input id="date" name="date" type="date" required defaultValue={initial?.date} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="type">区分</Label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value as TxType)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {Object.entries(TX_TYPES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="amount">金額（円）</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min={1}
          required
          defaultValue={initial?.amount}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="category">科目</Label>
        <select
          key={type}
          id="category"
          name="category"
          defaultValue={
            initial?.type === type ? initial.category : Object.keys(categories)[0]
          }
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {Object.entries(categories).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="title">摘要</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="projectId">企画（任意）</Label>
        <select
          id="projectId"
          name="projectId"
          defaultValue={initial?.projectId ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">なし</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="memo">メモ</Label>
        <Textarea id="memo" name="memo" defaultValue={initial?.memo ?? ""} />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive md:col-span-2">{state.error}</p>
      ) : null}
      <div className="md:col-span-2">
        <SubmitButton editing={Boolean(initial)} />
      </div>
    </form>
  );
}
