"use client";

import { useRouter } from "next/navigation";
import { ledgerSearchHref, type LedgerOrder } from "@/lib/ledger-query";
import type { ProjectDTO } from "@/types/domain";

export function LedgerFilters({
  projects,
  project,
  order,
}: {
  projects: ProjectDTO[];
  project?: string;
  order: LedgerOrder;
}) {
  const router = useRouter();

  function go(next: { project?: string; order?: LedgerOrder }) {
    router.push(
      ledgerSearchHref({
        project: next.project !== undefined ? next.project : project,
        order: next.order ?? order,
      })
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="space-y-1 text-sm">
        <span className="text-xs text-muted-foreground">企画</span>
        <select
          value={project ?? ""}
          onChange={(event) => go({ project: event.target.value || undefined })}
          className="flex h-9 min-w-[12rem] rounded-md border border-input bg-white px-3 text-sm"
        >
          <option value="">すべて</option>
          <option value="none">企画なし</option>
          {projects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-sm">
        <span className="text-xs text-muted-foreground">日付</span>
        <select
          value={order}
          onChange={(event) => go({ order: event.target.value as LedgerOrder })}
          className="flex h-9 min-w-[10rem] rounded-md border border-input bg-white px-3 text-sm"
        >
          <option value="desc">新しい順</option>
          <option value="asc">古い順</option>
        </select>
      </label>
    </div>
  );
}
