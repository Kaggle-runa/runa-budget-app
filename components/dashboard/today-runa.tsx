import Link from "next/link";
import { formatSignedYen, formatYen } from "@/lib/format";
import { formatSignedNmr, formatStakeNmr } from "@/lib/numerai";
import { cn } from "@/lib/utils";
import { runaTodayComment, type TodayRunaFeed } from "@/lib/today-runa";

type Tone = "plus" | "minus" | "neutral";

function formatPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function toneOf(value: number | null): Tone {
  if (value === null || value === 0) return "neutral";
  return value > 0 ? "plus" : "minus";
}

function toneBox(tone: Tone) {
  return cn(
    "rounded-2xl px-4 py-4",
    tone === "plus" && "bg-teal-50",
    tone === "minus" && "bg-rose-50",
    tone === "neutral" && "bg-zinc-100"
  );
}

function toneLabel(tone: Tone) {
  return cn(
    "text-sm",
    tone === "plus" && "text-teal-800",
    tone === "minus" && "text-rose-800",
    tone === "neutral" && "text-zinc-600"
  );
}

function toneValue(tone: Tone) {
  return cn(
    "tabular-nums font-semibold",
    tone === "plus" && "text-teal-700",
    tone === "minus" && "text-rose-700",
    tone === "neutral" && "text-zinc-800"
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-zinc-600">{label}</span>
      <span className={cn("shrink-0 tabular-nums font-semibold", tone && toneValue(tone))}>
        {value}
      </span>
    </div>
  );
}

export function TodayRunaCard({ feed }: { feed: TodayRunaFeed }) {
  const combined = feed.combinedDelta;
  const combinedTone = toneOf(combined);
  const workTone = toneOf(feed.dayNet);
  const nmrTone = toneOf(feed.nmr.yenDelta);
  const comment = runaTodayComment(feed);
  const nmrValue = feed.nmr.yenNow !== null ? formatYen(feed.nmr.yenNow) : "—";
  const nmrDelta =
    feed.nmr.yenDelta !== null ? formatSignedYen(feed.nmr.yenDelta) : "—";
  const nmrPct =
    feed.nmr.change24h !== null ? formatPct(feed.nmr.change24h) : null;

  return (
    <div>
      <p className="text-sm text-zinc-600">今日はどれくらい稼げたかな？</p>

      <div className={cn("mt-4", toneBox(combinedTone))}>
        <p className={toneLabel(combinedTone)}>今日の資産増減</p>
        <p className={cn("mt-2 text-3xl tracking-tight sm:text-4xl", toneValue(combinedTone))}>
          {combined !== null ? formatSignedYen(combined) : "—"}
        </p>
        <div className="mt-3 space-y-1 border-t border-black/5 pt-3">
          <Row label="今日のお仕事" value={formatSignedYen(feed.dayNet)} tone={workTone} />
          <Row label="NMRの評価額変動" value={nmrDelta} tone={nmrTone} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className={toneBox(workTone)}>
          <p className={toneLabel(workTone)}>お仕事</p>
          <div className="mt-3 space-y-1.5">
            <Row label="売上" value={formatYen(feed.dayIncome)} />
            <Row label="経費" value={formatYen(feed.dayExpense)} />
            <Row label="収支" value={formatSignedYen(feed.dayNet)} tone={workTone} />
          </div>
          {feed.lines.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">
              今日はまだお仕事の入出金はないよ。
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5 border-t border-black/5 pt-3">
              {feed.lines.map((line) => (
                <li
                  key={line.id}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span className="min-w-0">
                    <span className="mr-2" aria-hidden>
                      {line.icon}
                    </span>
                    {line.label}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 tabular-nums font-semibold",
                      line.tone === "plus" && "text-teal-700",
                      line.tone === "minus" && "text-rose-600",
                      line.tone === "muted" && "text-zinc-700"
                    )}
                  >
                    {line.value}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={toneBox(nmrTone)}>
          <p className={toneLabel(nmrTone)}>NMR</p>
          <div className="mt-3 space-y-1.5">
            <Row label="総NMR" value={formatStakeNmr(feed.nmr.amount)} />
            <Row label="Stake中" value={formatStakeNmr(feed.nmr.staked)} />
            {feed.nmr.available !== null ? (
              <Row label="旧ウォレット" value={formatStakeNmr(feed.nmr.available)} />
            ) : null}
            <Row label="現在価値" value={nmrValue} />
            <Row
              label="Stake前日比"
              value={formatSignedNmr(feed.nmr.stakeDelta)}
              tone={toneOf(feed.nmr.stakeDelta)}
            />
            <Row label="円の前日比" value={nmrDelta} tone={nmrTone} />
            {nmrPct ? <Row label="変化率" value={nmrPct} tone={nmrTone} /> : null}
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            PayoutとBurnはラウンドが終わって確定してから、Stakeの枚数に入るよ。まだの分は収入にも内訳にも入れてないよ。
            {feed.nmr.deltaSource === "holdings"
              ? feed.nmr.stakeDelta !== null
                ? " Stake前日比は枚数の増減、円の前日比は価格と枚数の変化を含むよ。"
                : " 円の前日比は昨日の円と比べてるよ。"
              : " いまの円の前日比は価格の24時間変化だけだよ。"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-sky-100 bg-white/80 px-4 py-4">
        <p className="text-sm font-semibold text-secondary">ルナのひとこと</p>
        <p className="mt-1 leading-relaxed text-zinc-800">「{comment}」</p>
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        <Link href="/numerai" className="underline decoration-zinc-300 underline-offset-2 hover:text-secondary">
          NMRってなに？
        </Link>
        <span className="mx-2">·</span>
        詳細を見る：
        <Link href="/dashboard" className="underline decoration-zinc-300 underline-offset-2 hover:text-secondary">
          収支
        </Link>
        {" / "}
        <Link href="/numerai" className="underline decoration-zinc-300 underline-offset-2 hover:text-secondary">
          Numerai
        </Link>
      </p>
    </div>
  );
}
