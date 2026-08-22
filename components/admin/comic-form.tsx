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

const PANELS = [
  { file: "panel1File", url: "panel1Url", label: "1コマ目" },
  { file: "panel2File", url: "panel2Url", label: "2コマ目" },
  { file: "panel3File", url: "panel3Url", label: "3コマ目" },
  { file: "panel4File", url: "panel4Url", label: "4コマ目" },
] as const;

export function ComicForm({ initial }: { initial?: ComicStripDTO }) {
  const [state, action] = useActionState(upsertComicStripAction, {});
  const urls = initial
    ? [initial.panel1Url, initial.panel2Url, initial.panel3Url, initial.panel4Url]
    : [];

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
      {PANELS.map((panel, index) => (
        <div key={panel.file} className="space-y-1.5">
          <Label htmlFor={panel.file}>{panel.label}</Label>
          {urls[index] ? (
            <p className="mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urls[index]}
                alt=""
                className="h-28 w-auto rounded-xl object-cover ring-1 ring-sky-200"
              />
            </p>
          ) : null}
          <Input
            id={panel.file}
            name={panel.file}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
          />
          <Input
            name={panel.url}
            type="text"
            defaultValue={urls[index] ?? ""}
            placeholder="/brand/yonkoma-1.jpg または https://"
          />
        </div>
      ))}
      <p className="text-xs text-muted-foreground md:col-span-2">
        4枚すべて必要です。ファイルを選ぶと Storage に上げます。ローカルの
        `/brand/...` や公開URLでも登録できます。JPEG / PNG / WebP / GIF、5MBまで。
      </p>
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
