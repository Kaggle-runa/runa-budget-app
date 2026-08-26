import Link from "next/link";
import { IdeaForm } from "@/components/ideas/idea-form";
import { IdeaList } from "@/components/ideas/idea-list";
import { GlassCard } from "@/components/layout/glass-card";
import { PageHeading } from "@/components/layout/page-heading";
import { PageShell } from "@/components/layout/page-shell";
import { formatSignedYen, formatYen } from "@/lib/format";
import {
  listIdeas,
  listProjects,
  listTransactions,
} from "@/lib/queries";
import {
  attachChallengeIdeas,
  challengeHref,
  summarizeChallenges,
} from "@/lib/survival";

export default async function IdeasPage() {
  const [ideas, projects, transactions] = await Promise.all([
    listIdeas(),
    listProjects(),
    listTransactions(),
  ]);
  const openIdeas = ideas.filter((idea) => idea.status !== "done");
  const pastIdeas = ideas.filter((idea) => idea.status === "done");
  const challenges = attachChallengeIdeas(
    summarizeChallenges(transactions, projects),
    ideas
  );
  const pastProjects = challenges.filter(
    (item) =>
      item.status === "completed" &&
      !ideas.some((idea) => idea.projectId === item.projectId)
  );

  return (
    <PageShell currentPath="/ideas">
      <div className="mb-6">
        <PageHeading
          title="企画募集"
          description="君の案、待ってるよ。採用したらカレンダーと取引明細に載せるね。実施中のカードは押すと詳細が見れるよ。"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] reveal reveal-2">
        <IdeaForm />
        <IdeaList ideas={openIdeas} />
      </div>
      <section id="past" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-secondary">これまでの結果</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          終わった挑戦は、ここに置いてあるよ。
        </p>
        {pastIdeas.length === 0 && pastProjects.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            まだ完了した挑戦は無いよ。
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {pastIdeas.length > 0 ? <IdeaList ideas={pastIdeas} /> : null}
            {pastProjects.map((item) => (
              <Link key={item.projectId} href={challengeHref(item)} className="block">
                <GlassCard className="p-4">
                  <p className="text-xs text-muted-foreground">完了した挑戦</p>
                  <h3 className="mt-1 font-semibold text-secondary">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600">
                    収益 {formatYen(item.income)} / トークン代 {formatYen(item.tokenCost)} /
                    稼いだ金額 {formatSignedYen(item.earned)}
                  </p>
                  <p className="mt-2 text-xs font-medium text-secondary">
                    くわしく見る →
                  </p>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
