import Link from "next/link";
import { GlassCard } from "@/components/layout/glass-card";
import { Button } from "@/components/ui/button";
import { formatYen } from "@/lib/format";
import {
  monthSurvivalStatus,
  totalAssetsYen,
} from "@/lib/survival";
import { cn } from "@/lib/utils";
import type { SurvivalSummary } from "@/types/domain";

function delay(ms: number) {
  return { ["--reveal-delay" as string]: `${ms}ms` };
}

function Breakdown({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs text-sky-700/80">{label}</dt>
      <dd className="mt-1 text-base font-semibold tabular-nums text-zinc-800">
        {value}
      </dd>
    </div>
  );
}

export function SurvivalStatusBoard({
  survival,
  nmrYen,
  asOf,
}: {
  survival: SurvivalSummary;
  nmrYen: number | null;
  asOf: string;
}) {
  const rate = survival.selfSufficiencyPercent;
  const month = monthSurvivalStatus(rate);
  const total = totalAssetsYen(survival.cash, survival.equipment, nmrYen);

  return (
    <section className="mt-8 space-y-4">
      <div data-reveal>
        <GlassCard className="p-6">
          <p className="text-sm text-sky-700/80">現在の総資産</p>
          <p className="mt-2 text-4xl font-semibold tabular-nums text-accent animate-pop-in sm:text-5xl">
            {formatYen(total)}
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <Breakdown label="現金" value={formatYen(survival.cash)} />
            <Breakdown
              label="NMR"
              value={nmrYen === null ? "—" : formatYen(nmrYen)}
            />
            <Breakdown label="機材" value={formatYen(survival.equipment)} />
          </dl>
          <p
            className={cn(
              "mt-5 inline-flex items-center rounded-full px-3 py-1 text-sm",
              month.tone === "ok" && "bg-emerald-50 text-emerald-800",
              month.tone === "short" && "bg-rose-50 text-rose-800",
              month.tone === "unknown" && "bg-zinc-100 text-zinc-700"
            )}
          >
            {month.tone === "ok" ? "🟢 " : month.tone === "short" ? "🔴 " : ""}
            {month.label}
          </p>
          <p className="mt-3 text-sm text-zinc-700">
            連続生存{" "}
            <span className="font-semibold tabular-nums">
              {survival.streakDays > 0 ? `${survival.streakDays}日` : "—"}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              所持金が尽きてない日数だよ
            </span>
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{asOf}</p>
        </GlassCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div data-reveal style={delay(80)}>
          <GlassCard className="h-full p-5">
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
                  {rate}%
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
          <GlassCard className="h-full p-5">
            <p className="text-sm text-sky-700/80">自力活動可能期間</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-secondary">
              {survival.runwayDays === null ? "—" : `${survival.runwayDays}日`}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              直近30日のご飯代から見ると、いまの現金であと何日動けるかの目安だよ
            </p>
          </GlassCard>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        総資産は現金 + 機材 + NMRの円だよ。損益や自給率にはNMRを入れないんだ。株やFXはまだ入れてないよ。
        <Button asChild variant="link" className="h-auto px-1 py-0 text-xs">
          <Link href="/ledger">明細を見る</Link>
        </Button>
      </p>
    </section>
  );
}
