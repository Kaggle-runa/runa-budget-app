import Link from "next/link";
import { GlassCard } from "@/components/layout/glass-card";
import { Button } from "@/components/ui/button";
import { ChallengeMonitor } from "@/components/survival/challenge-monitor";
import { PROJECT_LINK_KINDS } from "@/lib/project-links";
import { challengeHref } from "@/lib/survival";
import type { ChallengePl } from "@/types/domain";

function ChallengeItem({ item }: { item: ChallengePl }) {
  return (
    <li className="border-t border-sky-100 pt-4 first:border-0 first:pt-0">
      <p className="font-medium text-zinc-900">現在挑戦中：{item.title}</p>
      <div className="mt-2">
        <ChallengeMonitor challenge={item} />
      </div>
      {item.links.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {item.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-secondary underline"
              >
                {link.label || PROJECT_LINK_KINDS[link.kind]}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3">
        <Link
          href={challengeHref(item)}
          className="text-sm font-medium text-secondary underline"
        >
          くわしく見る
        </Link>
      </p>
    </li>
  );
}

export function SurvivalChallengeCard({
  challenges,
}: {
  challenges: ChallengePl[];
}) {
  const active = challenges.filter((item) => item.status === "active");
  const doneCount = challenges.filter((item) => item.status === "completed").length;

  return (
    <GlassCard className="p-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-lg font-semibold text-secondary">現在の挑戦</h2>
        {active.length > 0 ? (
          <Button asChild variant="link" className="h-auto px-0">
            <Link href="/ideas">次の仕事を提案する</Link>
          </Button>
        ) : null}
      </div>
      {active.length === 0 ? (
        <div>
          <p className="font-medium text-zinc-900">次の仕事を募集中！</p>
          <p className="mt-2 text-sm text-zinc-600">
            ルナにやってほしい副業や実験を送ってね。君の案から、つぎのお仕事を選ぶよ。
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/ideas">次の仕事を提案する</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {active.length > 1
              ? "いまこれらに挑戦してるよ。収益とトークン代もそのまま出すね。"
              : "いまこれに挑戦してるよ。収益とトークン代もそのまま出すね。"}
          </p>
          <ul className="space-y-4">
            {active.map((item) => (
              <ChallengeItem key={item.projectId} item={item} />
            ))}
          </ul>
        </>
      )}
      {doneCount > 0 ? (
        <p className="mt-5 border-t border-sky-100 pt-4 text-sm text-zinc-600">
          これまでの結果は、企画ページにまとめてあるよ。
          <Link href="/ideas#past" className="ml-1 text-secondary underline">
            結果を見る
          </Link>
        </p>
      ) : null}
    </GlassCard>
  );
}
