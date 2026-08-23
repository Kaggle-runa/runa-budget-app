"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_KINDS } from "@/lib/categories";
import { toDateTimeLocalValue } from "@/lib/format";
import { upsertEventAction } from "@/lib/actions/events";
import type { AnnouncementDTO, EventDTO, ProjectDTO } from "@/types/domain";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "保存中..." : editing ? "更新する" : "追加する"}
    </Button>
  );
}

export function EventForm({
  projects,
  announcements,
  initial,
}: {
  projects: ProjectDTO[];
  announcements: AnnouncementDTO[];
  initial?: EventDTO;
}) {
  const [state, action] = useActionState(upsertEventAction, {});

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="title">タイトル</Label>
        <Input id="title" name="title" required defaultValue={initial?.title} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="startAt">開始</Label>
        <Input
          id="startAt"
          name="startAt"
          type="datetime-local"
          required
          defaultValue={
            initial ? toDateTimeLocalValue(new Date(initial.startAt)) : undefined
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="endAt">終了</Label>
        <Input
          id="endAt"
          name="endAt"
          type="datetime-local"
          required
          defaultValue={
            initial ? toDateTimeLocalValue(new Date(initial.endAt)) : undefined
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="kind">種別</Label>
        <select
          id="kind"
          name="kind"
          defaultValue={initial?.kind ?? "stream"}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {Object.entries(EVENT_KINDS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
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
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="announcementId">お知らせリンク（任意）</Label>
        <select
          id="announcementId"
          name="announcementId"
          defaultValue={initial?.announcementId ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">なし</option>
          {announcements.map((item) => (
            <option key={item.id} value={item.id}>
              {item.published ? item.title : `（下書き）${item.title}`}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="linkUrl">外部リンク（任意）</Label>
        <Input
          id="linkUrl"
          name="linkUrl"
          type="url"
          placeholder="https://"
          defaultValue={initial?.linkUrl ?? ""}
        />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="body">詳細</Label>
        <Textarea
          id="body"
          name="body"
          rows={5}
          placeholder="クリックしたときに見える説明"
          defaultValue={initial?.body ?? ""}
        />
      </div>
      <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input
          type="checkbox"
          name="allDay"
          defaultChecked={initial?.allDay}
          className="h-4 w-4"
        />
        終日
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
