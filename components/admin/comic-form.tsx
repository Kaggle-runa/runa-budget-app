"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertComicStripAction } from "@/lib/actions/comics";
import type { ComicStripDTO } from "@/types/domain";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "保存中..." : editing ? "更新する" : "追加する"}
    </Button>
  );
}

export function ComicForm({ initial }: { initial?: ComicStripDTO }) {
  const [state, action] = useActionState(upsertComicStripAction, {});

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sortOrder">並び順（小さいほど上）</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={initial?.sortOrder ?? 0}
        />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="imageFile">4コマ画像（1枚）</Label>
        {initial?.imageUrl ? (
          <p className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={initial.imageUrl}
              alt=""
              className="h-40 w-auto rounded-xl object-cover ring-1 ring-sky-200"
            />
          </p>
        ) : null}
        <Input
          id="imageFile"
          name="imageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
        />
        <Input
          name="imageUrl"
          type="text"
          defaultValue={initial?.imageUrl ?? ""}
          placeholder="/brand/yonkoma-ops-fee.jpg または https://"
        />
        <p className="text-xs text-muted-foreground">
          4コマを縦に並べた1枚を登録します。ファイルを選ぶと Storage に上げます。JPEG /
          PNG / WebP / GIF、5MBまで。
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input
          type="checkbox"
          name="published"
          defaultChecked={initial?.published ?? true}
          className="h-4 w-4"
        />
        公開する
      </label>
      {state.error ? (
        <p className="text-sm text-destructive md:col-span-2">{state.error}</p>
      ) : null}
      <div className="md:col-span-2">
        <SubmitButton editing={Boolean(initial)} />
      </div>
    </form>
  );
}
