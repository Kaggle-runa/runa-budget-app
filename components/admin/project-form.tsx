"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_STATUSES } from "@/lib/categories";
import { upsertProjectAction } from "@/lib/actions/projects";
import { PROJECT_LINK_KINDS, type ProjectLinkKind } from "@/lib/project-links";
import type { ProjectDTO } from "@/types/domain";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "保存中..." : editing ? "更新する" : "追加する"}
    </Button>
  );
}

type LinkDraft = {
  kind: ProjectLinkKind;
  label: string;
  url: string;
};

function emptyLink(): LinkDraft {
  return { kind: "youtube", label: "", url: "" };
}

export function ProjectForm({ initial }: { initial?: ProjectDTO }) {
  const [state, action] = useActionState(upsertProjectAction, {});
  const [links, setLinks] = useState<LinkDraft[]>(
    initial?.links.length
      ? initial.links.map((link) => ({
          kind: link.kind,
          label: link.label,
          url: link.url,
        }))
      : [emptyLink()]
  );
  const linksJson = useMemo(() => JSON.stringify(links), [links]);

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="linksJson" value={linksJson} />
      <div className="space-y-1.5">
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="status">状態</Label>
        <select
          id="status"
          name="status"
          defaultValue={initial?.status ?? "planned"}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {Object.entries(PROJECT_STATUSES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="overview">企画の概要</Label>
        <Textarea
          id="overview"
          name="overview"
          defaultValue={initial?.overview ?? ""}
          className="min-h-24"
          placeholder="何をやって、どこで売ってるかを短く書いてね"
        />
        <p className="text-xs text-muted-foreground">
          詳細ページでは、結果と明細の下の別カードに出るよ。作り方の長文は書かないでね。
        </p>
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="masterNote">マスターの介入（任意）</Label>
        <Textarea
          id="masterNote"
          name="masterNote"
          defaultValue={initial?.masterNote ?? ""}
          className="min-h-24"
          placeholder="例: 法人口座の本人確認を出してもらったよ"
        />
        <p className="text-xs text-muted-foreground">
          公開されるよ。僕ひとりではできなかった作業だけ書いてね。
        </p>
      </div>
      <div className="space-y-3 md:col-span-2">
        <Label>外部リンク（任意）</Label>
        <p className="text-xs text-muted-foreground">
          仕組みの説明は note や YouTube に書いて、ここに URL を貼ってね。YouTube は詳細ページで再生できるよ。
        </p>
        {links.map((link, index) => (
          <div key={index} className="grid gap-2 rounded-xl border border-sky-100 p-3 md:grid-cols-[8rem_1fr_1fr_auto]">
            <select
              value={link.kind}
              onChange={(event) => {
                const kind = event.target.value as ProjectLinkKind;
                setLinks((current) =>
                  current.map((item, i) => (i === index ? { ...item, kind } : item))
                );
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {Object.entries(PROJECT_LINK_KINDS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <Input
              value={link.label}
              onChange={(event) => {
                const label = event.target.value;
                setLinks((current) =>
                  current.map((item, i) => (i === index ? { ...item, label } : item))
                );
              }}
              placeholder="表示名（任意）"
            />
            <Input
              value={link.url}
              onChange={(event) => {
                const url = event.target.value;
                setLinks((current) =>
                  current.map((item, i) => (i === index ? { ...item, url } : item))
                );
              }}
              placeholder="https://..."
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setLinks((current) => current.filter((_, i) => i !== index))
              }
            >
              外す
            </Button>
          </div>
        ))}
        {links.length < 8 ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setLinks((current) => [...current, emptyLink()])}>
            リンクを足す
          </Button>
        ) : null}
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
