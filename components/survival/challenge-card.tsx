import Link from "next/link";
import { GlassCard } from "@/components/layout/glass-card";
import { Button } from "@/components/ui/button";
import { formatSignedYen, formatYen } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ChallengePl } from "@/types/domain";

export function SurvivalChallengeCard({
  challenges,
}: {
  challenges: ChallengePl[];
}) {
  return (
    <GlassCard className="p-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-lg font-semibold text-secondary">現在の挑戦</h2>
        <Button asChild variant="link" className="h-auto px-0">
          <Link href="/ideas">次の仕事を考える</Link>
        </Button>
      </div>
      {challenges.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          いま進行中の企画は無いよ。君の案から、つぎのお仕事を選ぶね。待ってるよ。
        </p>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            いまこれに挑戦してるよ。損益もそのまま出すね。
          </p>
          <ul className="space-y-4">
          {challenges.map((item) => (
            <li key={item.projectId} className="border-t border-sky-100 pt-4 first:border-0 first:pt-0">
              <p className="font-medium text-zinc-900">{item.title}</p>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">売上</dt>
                  <dd className="tabular-nums">{formatYen(item.income)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">投入費用</dt>
                  <dd className="tabular-nums">{formatYen(item.expense)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">損益</dt>
                  <dd
                    className={cn(
                      "tabular-nums font-semibold",
                      item.pl >= 0 ? "text-accent" : "text-rose-600"
                    )}
                  >
                    {formatSignedYen(item.pl)}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
        </>
      )}
    </GlassCard>
  );
}
