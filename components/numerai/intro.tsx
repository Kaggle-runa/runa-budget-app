import Link from "next/link";
import { SITE } from "@/lib/constants";

const TERMS = [
  {
    name: "CORR",
    icon: "📊",
    oneLiner: "予測がどれくらい当たった？",
    body: "僕の予測と実際の結果が、どれくらい一致していたかを見る指標だよ。",
  },
  {
    name: "MMC",
    icon: "🧠",
    oneLiner: "他のモデルにはない価値を出せた？",
    body: "僕の予測が、Numerai全体のMeta Modelにどれくらい新しい価値を加えられたかを見る指標だね。",
  },
  {
    name: "Stake",
    icon: "💰",
    oneLiner: "僕がこの予測に預けているNMR（仮想通貨）",
    body: "僕の予測にNMRをStake（賭ける）している量だよ。ラウンドごとにオンチェーンでロックされて、成績によって増えたり減ったりするんだ。昔のウォレット残高とは別だよ。",
  },
] as const;

export function NumeraiIntro() {
  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-sky-100 bg-white/80 px-5 py-5 text-sm leading-relaxed text-zinc-700">
        <h2 className="text-lg font-bold text-secondary">ところでNumeraiってなに？</h2>
        <p>
          Numeraiは、金融データを使って予測モデルの精度を競うデータサイエンス大会だよ。
        </p>
        <p>
          モデルの成績にNMR（仮想通貨）をStake（賭ける）すると、結果に応じて増えたり減ったりするんだ。いまはラウンドごとにオンチェーンでロックする方式だよ。
        </p>
        <details className="rounded-xl bg-sky-50/80 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-secondary">
            もう少し詳しく見る
          </summary>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-700">
            <p>
              実際の市場データを難読化したデータセットが無料で公開されていて、参加者はそのデータを使って予測モデルを作り、結果を提出するんだ。
            </p>
            <p>
              Stakeされた予測はMeta Modelにまとめられて、Numeraiのヘッジファンド運用にも活用されているよ。
            </p>
            <p>
              詳しい仕組みは{" "}
              <Link
                href={SITE.numeraiDocsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-secondary underline"
              >
                Numerai Docs
              </Link>
              、Stakeの置き方は{" "}
              <Link
                href={SITE.numeraiStakingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-secondary underline"
              >
                Atomic Blockchain Staking
              </Link>{" "}
              に載ってるよ。日本語で読みたい場合は{" "}
              <Link
                href={SITE.numeraiTipsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-secondary underline"
              >
                新規参加者向けTips
              </Link>{" "}
              も参考になるね。
            </p>
          </div>
        </details>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {TERMS.map((term) => (
          <div
            key={term.name}
            className="rounded-2xl border border-sky-100 bg-white/80 px-4 py-4"
          >
            <p className="font-semibold text-zinc-900">
              <span className="mr-1.5" aria-hidden>
                {term.icon}
              </span>
              {term.name}
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-800">{term.oneLiner}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">{term.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
