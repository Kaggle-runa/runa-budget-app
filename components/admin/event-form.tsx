"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EVENT_KINDS } from "@/lib/categories";
import { toDateTimeLocalValue } from "@/lib/format";
import { upsertEventAction } from "@/lib/actions/events";
import type { EventDTO, ProjectDTO } from "@/types/domain";

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
  initial,
}: {
  projects: ProjectDTO[];
  initial?: EventDTO;
}) {
  const [state, action] = useFormState(upsertEventAction, {});

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
