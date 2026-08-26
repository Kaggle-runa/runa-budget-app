import { AdminNav } from "@/components/admin/admin-nav";
import { DeleteButton } from "@/components/admin/delete-button";
import { GlassCard } from "@/components/layout/glass-card";
import { Button } from "@/components/ui/button";
import { IDEA_STATUSES, ideaStatusLabel } from "@/lib/categories";
import { formatDateDot } from "@/lib/format";
import { deleteIdeaAction, updateIdeaStatusAction } from "@/lib/actions/ideas";
import { listIdeas, listProjects } from "@/lib/queries";

export default async function AdminIdeasPage() {
  const [ideas, projects] = await Promise.all([listIdeas(), listProjects()]);

  return (
    <>
      <AdminNav currentPath="/admin/ideas" />
      <h1 className="mb-4 text-2xl font-bold text-secondary">企画のモデレーション</h1>
      <div className="space-y-3">
        {ideas.map((idea) => (
          <GlassCard key={idea.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {idea.displayName} / {formatDateDot(new Date(idea.createdAt))}
                </p>
                <h2 className="mt-1 font-semibold text-secondary">{idea.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{idea.body}</p>
              </div>
              <DeleteButton action={deleteIdeaAction} id={idea.id} />
            </div>
            <form action={updateIdeaStatusAction} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={idea.id} />
              <select
                name="status"
                defaultValue={idea.status}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {Object.entries(IDEA_STATUSES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                name="projectId"
                defaultValue={idea.projectId ?? ""}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">挑戦なし</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm">
                {ideaStatusLabel(idea.status)} を更新
              </Button>
            </form>
          </GlassCard>
        ))}
      </div>
    </>
  );
}
