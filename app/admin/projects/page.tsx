import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { DeleteButton } from "@/components/admin/delete-button";
import { ProjectForm } from "@/components/admin/project-form";
import { GlassCard } from "@/components/layout/glass-card";
import { projectStatusLabel } from "@/lib/categories";
import { deleteProjectAction } from "@/lib/actions/projects";
import { formatYen } from "@/lib/format";
import { listProjects, listTransactions } from "@/lib/queries";
import { summarizeChallenges } from "@/lib/survival";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const [projects, transactions] = await Promise.all([
    listProjects(),
    listTransactions(),
  ]);
  const editing = projects.find((project) => project.id === id);
  const monitor = summarizeChallenges(transactions, projects);
  const byId = new Map(monitor.map((item) => [item.projectId, item]));

  return (
    <>
      <AdminNav currentPath="/admin/projects" />
      <h1 className="mb-4 text-2xl font-bold text-secondary">挑戦の登録</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        進行中にすると公開トップの「現在の挑戦」に出るよ。明細の企画欄に同じ挑戦を付けると、売上とトークン代が集計されるよ。
      </p>
      <GlassCard className="mb-6 p-5">
        {editing ? (
          <p className="mb-3 text-sm">
            編集中: {editing.title}{" "}
            <Link href="/admin/projects" className="text-secondary underline">
              新規に戻る
            </Link>
          </p>
        ) : null}
        <ProjectForm initial={editing} />
      </GlassCard>
      <GlassCard className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-sm">
          <thead className="bg-sky-50/80 text-left">
            <tr>
              <th className="px-4 py-3">タイトル</th>
              <th className="px-4 py-3">状態</th>
              <th className="px-4 py-3">収益</th>
              <th className="px-4 py-3">トークン代</th>
              <th className="px-4 py-3">稼いだ金額</th>
              <th className="px-4 py-3">介入</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const row = byId.get(project.id);
              const canDelete = !transactions.some((tx) => tx.projectId === project.id);
              return (
                <tr key={project.id} className="border-t border-pink-100">
                  <td className="px-4 py-3">{project.title}</td>
                  <td className="px-4 py-3">
                    {projectStatusLabel(project.status)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatYen(row?.income ?? 0)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatYen(row?.tokenCost ?? 0)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatYen(row?.earned ?? 0)}
                  </td>
                  <td className="max-w-[16rem] px-4 py-3 text-muted-foreground">
                    {project.masterNote || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/projects?id=${project.id}`}
                        className="text-secondary underline"
                      >
                        編集
                      </Link>
                      {canDelete ? (
                        <DeleteButton action={deleteProjectAction} id={project.id} />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          明細あり
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>
    </>
  );
}
