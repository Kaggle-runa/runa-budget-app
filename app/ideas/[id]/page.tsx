import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/layout/glass-card";
import { PageHeading } from "@/components/layout/page-heading";
import { PageShell } from "@/components/layout/page-shell";
import { ChallengeOverview } from "@/components/survival/challenge-links";
import { ChallengeMonitor } from "@/components/survival/challenge-monitor";
import { ideaStatusLabel } from "@/lib/categories";
import { formatDateDot } from "@/lib/format";
import {
  getIdea,
  listProjects,
  listTransactions,
} from "@/lib/queries";
import { ideaHasPublicDetail, summarizeChallenges } from "@/lib/survival";

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idea = await getIdea(id);
  if (!idea || !ideaHasPublicDetail(idea.status)) notFound();

  const [transactions, projects] = await Promise.all([
    listTransactions(),
    listProjects(),
  ]);
  const challenge = idea.projectId
    ? summarizeChallenges(transactions, projects).find(
        (item) => item.projectId === idea.projectId
      )
    : null;
  const overview = challenge?.overview || idea.body;

  return (
    <PageShell currentPath="/ideas">
      <p className="mb-4 text-sm">
        <Link href="/ideas" className="text-secondary hover:underline">
          企画へ戻る
        </Link>
      </p>
      <PageHeading title={idea.title} />
      <p className="mt-2 text-sm text-muted-foreground">
        {ideaStatusLabel(idea.status)}
        <span className="mx-2">·</span>
        {idea.displayName} / {formatDateDot(new Date(idea.createdAt))}
      </p>
      <GlassCard className="mt-6 p-5">
        <h2 className="text-lg font-semibold text-secondary">結果と金額</h2>
        <p className="mt-2 text-sm text-zinc-600">
          仕組みの長い話は note や YouTube に任せるよ。ここではいくら使って、いくら稼げたかを出すね。
        </p>
        {challenge ? (
          <div className="mt-3">
            <ChallengeMonitor challenge={challenge} transactions={transactions} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            まだ挑戦の数字には紐づいてないよ。採用して明細を付けたら、ここに収益とトークン代が出るよ。
          </p>
        )}
      </GlassCard>
      <ChallengeOverview overview={overview} links={challenge?.links ?? []} />
    </PageShell>
  );
}
