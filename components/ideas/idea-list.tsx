import Link from "next/link";
import { EmptyState } from "@/components/layout/empty-state";
import { GlassCard } from "@/components/layout/glass-card";
import { ideaStatusLabel } from "@/lib/categories";
import { formatDateDot } from "@/lib/format";
import { ideaHasPublicDetail } from "@/lib/survival";
import { cn } from "@/lib/utils";
import type { IdeaDTO } from "@/types/domain";

const STATUS_TONE: Record<string, string> = {
  submitted: "bg-cyan-100 text-cyan-800",
  reviewing: "bg-yellow-100 text-yellow-800",
  adopted: "bg-purple-100 text-purple-800",
  in_progress: "bg-pink-100 text-pink-800",
  done: "bg-green-100 text-green-800",
};

function IdeaMeta({ idea }: { idea: IdeaDTO }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs",
          STATUS_TONE[idea.status] ?? "bg-muted"
        )}
      >
        {ideaStatusLabel(idea.status)}
      </span>
      <span className="text-xs text-muted-foreground">
        {idea.displayName} / {formatDateDot(new Date(idea.createdAt))}
      </span>
    </div>
  );
}

export function IdeaList({ ideas }: { ideas: IdeaDTO[] }) {
  if (ideas.length === 0) {
    return (
      <EmptyState
        title="まだ企画がないよ"
        description="最初の企画、君から送ってみない？"
      />
    );
  }

  return (
    <div className="space-y-3">
      {ideas.map((idea) => {
        const clickable = ideaHasPublicDetail(idea.status);
        const inner = (
          <>
            <IdeaMeta idea={idea} />
            <h3 className="mt-2 font-semibold text-secondary">{idea.title}</h3>
            <p
              className={cn(
                "mt-1 text-sm text-muted-foreground",
                clickable && "line-clamp-2"
              )}
            >
              {idea.body}
            </p>
            {clickable ? (
              <p className="mt-2 text-xs font-medium text-secondary">くわしく見る →</p>
            ) : null}
          </>
        );

        if (clickable) {
          return (
            <Link key={idea.id} href={`/ideas/${idea.id}`} className="block">
              <GlassCard className="p-4">{inner}</GlassCard>
            </Link>
          );
        }

        return (
          <GlassCard key={idea.id} className="p-4">
            {inner}
          </GlassCard>
        );
      })}
    </div>
  );
}
