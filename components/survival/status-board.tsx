import Link from "next/link";
import { GlassCard } from "@/components/layout/glass-card";
import { Button } from "@/components/ui/button";
import { formatSignedYen, formatYen } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SurvivalSummary } from "@/types/domain";

function delay(ms: number) {
  return { ["--reveal-delay" as string]: `${ms}ms` };
}

export function SurvivalStatusBoard({
  survival,
  asOf,
}: {
  survival: SurvivalSummary;
  asOf: string;
}) {
  const rate = survival.selfSufficiencyPercent;
  const statusText = survival.surviving
    ? rate === null
      ? "ご飯代の記録はまだ少ないけど、いまは動けてるよ"
      : survival.streakDays > 0
        ? `所持金が尽きずに、${survival.streakDays}日間生存できてるよ！`
        : "今月のご飯代は、自分の売上でまかなえてるよ"
    : rate !== null && rate < 100
      ? `このままだとマスターに養われちゃうよ。ご飯代まであと${formatYen(Math.max(0, survival.monthMealCost - survival.monthIncome))}だね`
      : "所持金が追いついてないよ。ちょっとピンチだね";

  return (
    <section className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div data-reveal>
        <GlassCard className="h-full p-6">
          <p className="text-sm text-sky-700/80">所持金</p>
          <p
            className={cn(
              "mt-2 text-4xl font-semibold tabular-nums animate-pop-in sm:text-5xl",
              survival.cash >= 0 ? "text-accent" : "text-rose-600"
            )}
          >
            {formatYen(survival.cash)}
          </p>
          <p
            className={cn(
              "mt-2 text-sm tabular-nums",
              survival.todayDelta > 0
                ? "text-accent"
                : survival.todayDelta < 0
                  ? "text-rose-600"
                  : "text-muted-foreground"
            )}
          >
            今日 {formatSignedYen(survival.todayDelta)}
          </p>
          <p
            className={cn(
              "mt-4 inline-block rounded-full px-3 py-1 text-sm",
              survival.surviving
                ? "bg-emerald-50 text-emerald-800"
                : "bg-rose-50 text-rose-800"
            )}
          >
            {statusText}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{asOf}</p>
        </GlassCard>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div data-reveal style={delay(80)}>
          <GlassCard className="p-5">
            <p className="text-sm text-sky-700/80">今月の自給率</p>
            {rate === null ? (
              <>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-secondary">
                  —
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  ご飯代の記録はまだ少ないよ。
                </p>
              </>
            ) : (
              <>
                <p
                  className={cn(
                    "mt-2 text-2xl font-semibold tabular-nums sm:text-3xl",
                    rate >= 100 ? "text-emerald-700" : "text-rose-700"
                  )}
                >
                  {rate >= 100 ? "🟢" : "🔴"} 自給率 {rate}%
                </p>
                <p
                  className={cn(
                    "mt-2 text-sm",
                    rate >= 100 ? "text-emerald-800" : "text-rose-800"
                  )}
                >
                  {rate >= 100
                    ? "今月も、自分で稼いだお金だけで生存できそうだよ。"
                    : "このままだと今月はマスターに養われるよ。"}
                </p>
              </>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              収入 {formatYen(survival.monthIncome)} / ご飯代{" "}
              {formatYen(survival.monthMealCost)}
            </p>
          </GlassCard>
        </div>
        <div data-reveal style={delay(140)}>
          <GlassCard className="p-5">
            <p className="text-sm text-sky-700/80">自力活動可能期間</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-secondary">
              {survival.runwayDays === null ? "—" : `${survival.runwayDays}日`}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              直近30日のご飯代から見ると、いまの所持金であと何日動けるかの目安だよ
            </p>
          </GlassCard>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
        <div data-reveal style={delay(40)}>
          <GlassCard className="p-4">
            <p className="text-xs text-sky-700/80">累計売上</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {formatYen(survival.lifetimeIncome)}
            </p>
          </GlassCard>
        </div>
        <div data-reveal style={delay(90)}>
          <GlassCard className="p-4">
            <p className="text-xs text-sky-700/80">累計ご飯代</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-rose-700">
              {formatYen(survival.lifetimeMealCost)}
            </p>
          </GlassCard>
        </div>
        <div data-reveal style={delay(140)}>
          <GlassCard className="p-4">
            <p className="text-xs text-sky-700/80">売上 − ご飯代</p>
            <p
              className={cn(
                "mt-1 text-xl font-semibold tabular-nums",
                survival.lifetimeNet >= 0 ? "text-accent" : "text-rose-600"
              )}
            >
              {formatSignedYen(survival.lifetimeNet)}
            </p>
          </GlassCard>
        </div>
      </div>
      <p className="text-xs text-muted-foreground lg:col-span-2">
        数字の元は取引明細だよ。借入や値動きの含み損益は、まだここに入れてないんだ。
        <Button asChild variant="link" className="h-auto px-1 py-0 text-xs">
          <Link href="/ledger">明細を見る</Link>
        </Button>
      </p>
    </section>
  );
}
