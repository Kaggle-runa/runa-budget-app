import type { ReactNode } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/layout/glass-card";
import { Button } from "@/components/ui/button";
import { formatYen } from "@/lib/format";
import {
  formatCorr,
  formatReturnPct,
  formatStakeNmr,
  isModelTraining,
  modelStakeYen,
} from "@/lib/numerai";
import { cn } from "@/lib/utils";
import type { NmrQuote, NumeraiModelSnapshot } from "@/types/domain";

function formatCorrRank(value: number | null): string {
  if (value === null) return "—";
  return `${value.toLocaleString("ja-JP")}位`;
}

function returnTone(value: number | null): "plus" | "minus" | "muted" {
  if (value === null) return "muted";
  if (value > 0) return "plus";
  if (value < 0) return "minus";
  return "muted";
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "main" | "live" | "train";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "main" && "bg-sky-100 text-sky-800",
        tone === "live" && "bg-teal-100 text-teal-800",
        tone === "train" && "bg-amber-100 text-amber-800"
      )}
    >
      {children}
    </span>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "plus" | "minus" | "muted";
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums",
          tone === "plus" && "text-accent",
          tone === "minus" && "text-rose-600",
          tone === "muted" && "text-zinc-500"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function NumeraiModelCard({
  model,
  quote,
  featured,
}: {
  model: NumeraiModelSnapshot;
  quote?: NmrQuote;
  featured?: boolean;
}) {
  const training = isModelTraining(model);
  const yen = quote ? modelStakeYen(model, quote) : null;
  const recentTone = returnTone(model.return1d);

  return (
    <GlassCard className="flex h-full flex-col p-5">
      <div className="flex flex-wrap items-center gap-2">
        {featured ? <Badge tone="main">メインモデル</Badge> : null}
        {training ? (
          <Badge tone="train">🧪 育成中</Badge>
        ) : (
          <Badge tone="live">稼働中</Badge>
        )}
      </div>
      <h2 className="mt-3 font-display text-xl text-secondary">
        {`${model.headline} ${model.name}`}
      </h2>
      <p className="mt-1 text-sm text-zinc-600">
        {featured ? "僕のメインモデル" : model.blurb}
      </p>

      {training ? (
        <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-4">
          <p className="text-sm font-semibold text-amber-900">評価待ち</p>
          <p className="mt-2 text-sm leading-relaxed text-amber-900/80">
            まだ評価データが足りないよ。スコアが出るまで、もう少し待っててね。
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-2xl bg-teal-50 px-4 py-4">
            <p className="text-sm text-teal-800">💰 現在のStake価値</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-teal-700">
              {yen !== null ? `約${formatYen(yen)}` : "—"}
            </p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-teal-800">
              {formatStakeNmr(model.nmrStaked)}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-zinc-800">🤖 総合ステータス</p>
            <div className="mt-2 grid grid-cols-3 gap-3">
              <MiniStat label="CORR" value={formatCorr(model.corr)} />
              <MiniStat label="MMC" value={formatCorr(model.mmc)} />
              <MiniStat label="Rank" value={formatCorrRank(model.corrRank)} />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-zinc-800">📈 直近1日</p>
            <p
              className={cn(
                "mt-1 text-lg font-semibold tabular-nums",
                recentTone === "plus" && "text-accent",
                recentTone === "minus" && "text-rose-600",
                recentTone === "muted" && "text-zinc-500"
              )}
            >
              {formatReturnPct(model.return1d)}
            </p>
          </div>
        </>
      )}

      <Button asChild variant="link" className="mt-auto h-auto px-0 pt-4 font-semibold">
        <Link href={model.profileUrl} target="_blank" rel="noreferrer">
          Numeraiで見る
        </Link>
      </Button>
    </GlassCard>
  );
}
