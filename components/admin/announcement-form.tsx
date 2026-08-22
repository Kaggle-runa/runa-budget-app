"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/categories";
import { toDateInputValue } from "@/lib/format";
import { upsertAnnouncementAction } from "@/lib/actions/announcements";
import type { AnnouncementDTO } from "@/types/domain";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "保存中..." : editing ? "更新する" : "追加する"}
    </Button>
  );
}

export function AnnouncementForm({ initial }: { initial?: AnnouncementDTO }) {
  const [state, action] = useActionState(upsertAnnouncementAction, {});

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="category">区分</Label>
        <select
          id="category"
          name="category"
          defaultValue={initial?.category ?? "news"}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {Object.entries(ANNOUNCEMENT_CATEGORIES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="publishedAt">日付</Label>
        <Input
          id="publishedAt"
          name="publishedAt"
          type="date"
          required
          defaultValue={
            initial
              ? toDateInputValue(new Date(initial.publishedAt))
              : undefined
          }
        />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="coverFile">画像（任意）</Label>
        {initial?.coverUrl ? (
          <p className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={initial.coverUrl}
              alt=""
              className="h-24 w-40 rounded-xl object-cover ring-1 ring-sky-200"
            />
          </p>
        ) : null}
        <Input
          id="coverFile"
          name="coverFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
        />
        <p className="text-xs text-muted-foreground">
          JPEG / PNG / WebP / GIF。5MBまで。新しいファイルを選ぶと差し替えます。
        </p>
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="coverUrl">画像URL（任意）</Label>
        <Input
          id="coverUrl"
          name="coverUrl"
          type="url"
          defaultValue={initial?.coverUrl ?? ""}
          placeholder="https://"
        />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="body">本文</Label>
        <Textarea
          id="body"
          name="body"
          required
          defaultValue={initial?.body}
          className="min-h-32"
        />
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
