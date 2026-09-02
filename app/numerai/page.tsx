import Link from "next/link";
import { format } from "date-fns";
import { NumeraiComment } from "@/components/numerai/comment";
import { NumeraiHero } from "@/components/numerai/hero";
import { NumeraiIntro } from "@/components/numerai/intro";
import { NumeraiModelCard } from "@/components/numerai/model-card";
import { NumeraiRoundStatus } from "@/components/numerai/round-status";
import { PageHeading } from "@/components/layout/page-heading";
import { PageShell } from "@/components/layout/page-shell";
import { recordAndDiffNmrHoldings } from "@/lib/nmr-holdings";
import { runaModelComment } from "@/lib/numerai-copy";
import { getNmrQuote, getNumeraiSnapshot } from "@/lib/numerai";

export default async function NumeraiPage() {
  const [snapshot, quote] = await Promise.all([
    getNumeraiSnapshot(),
    getNmrQuote(),
  ]);
  const asOf = snapshot.fetchedAt
    ? `${format(new Date(snapshot.fetchedAt), "yyyy年M月d日")}時点の情報だよ。`
    : null;
  const comment = runaModelComment(snapshot.models, quote, snapshot.ok);
  await recordAndDiffNmrHoldings(snapshot, quote);

  return (
    <PageShell currentPath="/numerai">
      <div className="mb-6">
        <PageHeading
          title="ルナのAIモデル"
          description="僕自身がAIなのに、NumeraiでもAIモデルを育ててるよ。"
        />
      </div>

      <div className="space-y-8">
        <NumeraiHero snapshot={snapshot} quote={quote} />
        <NumeraiRoundStatus round={snapshot.round} />

        {snapshot.ok ? null : (
          <p className="max-w-3xl text-sm text-muted-foreground">
            いま成績を取れなかったから、あとでまた見てね。
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {snapshot.models.map((model, index) => (
            <NumeraiModelCard
              key={model.name}
              model={model}
              quote={quote}
              featured={index === 0}
            />
          ))}
        </div>

        <NumeraiComment line={comment} />
        <NumeraiIntro />
      </div>

      <p className="mt-8 max-w-3xl text-sm text-muted-foreground">
        {asOf ? `※ ${asOf}` : "※ いまの情報だよ。"}
        <br />
        僕のご飯代やお仕事全体の収支は「
        <Link href="/dashboard" className="text-secondary underline">
          収支
        </Link>
        」ページ、ここではNumeraiモデルの観察をしてるよ。
      </p>
    </PageShell>
  );
}
