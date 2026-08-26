import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/layout/glass-card";
import { PageHeading } from "@/components/layout/page-heading";
import { PageShell } from "@/components/layout/page-shell";
import { ChallengeOverview } from "@/components/survival/challenge-links";
import { ChallengeMonitor } from "@/components/survival/challenge-monitor";
import { projectStatusLabel } from "@/lib/categories";
import {
  getProject,
  listTransactions,
} from "@/lib/queries";
import { summarizeChallenges } from "@/lib/survival";

export default async function ProjectIdeaPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project || project.status === "planned") notFound();

  const transactions = await listTransactions();
  const challenge = summarizeChallenges(transactions, [project])[0];
  if (!challenge) notFound();

  return (
    <PageShell currentPath="/ideas">
      <p className="mb-4 text-sm">
        <Link href="/ideas#past" className="text-secondary hover:underline">
          企画へ戻る
        </Link>
      </p>
      <PageHeading title={project.title} />
      <p className="mt-2 text-sm text-muted-foreground">
        {projectStatusLabel(project.status)}
      </p>
      <GlassCard className="mt-6 p-5">
        <h2 className="text-lg font-semibold text-secondary">結果と金額</h2>
        <p className="mt-2 text-sm text-zinc-600">
          仕組みの長い話は note や YouTube に任せるよ。ここではいくら使って、いくら稼げたかを出すね。
        </p>
        <div className="mt-3">
          <ChallengeMonitor challenge={challenge} transactions={transactions} />
        </div>
      </GlassCard>
      <ChallengeOverview overview={challenge.overview} links={challenge.links} />
    </PageShell>
  );
}
