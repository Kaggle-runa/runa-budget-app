import Link from "next/link";
import { Moon, Star } from "lucide-react";
import { TodayRunaCard } from "@/components/dashboard/today-runa";
import { GlassCard } from "@/components/layout/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { Wordmark } from "@/components/layout/wordmark";
import { RunaTachie } from "@/components/motion/runa-tachie";
import { YonKoma } from "@/components/motion/yon-koma";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import { SurvivalChallengeCard } from "@/components/survival/challenge-card";
import { SurvivalStatusBoard } from "@/components/survival/status-board";
import { SITE } from "@/lib/constants";
import { formatAsOf } from "@/lib/format";
import { getNmrQuote, getNumeraiSnapshot } from "@/lib/numerai";
import { buildTodayRunaFeed } from "@/lib/today-runa";
import {
  getLatestUpdatedAt,
  listAnnouncements,
  listComicStrips,
  listIdeas,
  listProjects,
  listTransactions,
} from "@/lib/queries";
import {
  attachChallengeIdeas,
  summarizeChallenges,
  summarizeSurvival,
} from "@/lib/survival";

function delay(ms: number) {
  return { ["--reveal-delay" as string]: `${ms}ms` };
}

export default async function HomePage() {
  const [transactions, projects, latest, news, comics, numerai, nmr, ideas] =
    await Promise.all([
      listTransactions(),
      listProjects(),
      getLatestUpdatedAt(),
      listAnnouncements({ publishedOnly: true, take: 3 }),
      listComicStrips({ publishedOnly: true }),
      getNumeraiSnapshot(),
      getNmrQuote(),
      listIdeas(),
    ]);
  const survival = summarizeSurvival(transactions);
  const challenges = attachChallengeIdeas(
    summarizeChallenges(transactions, projects),
    ideas
  );
  const todayFeed = buildTodayRunaFeed(transactions, numerai, nmr);

  return (
    <PageShell currentPath="/">
      <section className="hero-stage">
        <div className="relative z-10 grid items-center gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p
              data-reveal
              style={delay(40)}
              className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm text-sky-700 ring-1 ring-sky-200 animate-float-y"
            >
              <Moon className="h-4 w-4" />
              ルナの{SITE.experimentLabel}
              <Star className="h-3.5 w-3.5 fill-amber-200 text-amber-400" />
            </p>
            <h1 className="sr-only">{SITE.name}</h1>
            <div data-reveal style={delay(120)}>
              <Wordmark size="hero" priority />
              <p className="mt-1 text-sm text-sky-700/70">{SITE.reading}</p>
            </div>
            <p
              data-reveal
              style={delay(220)}
              className="mt-4 font-display text-2xl leading-snug text-secondary sm:text-3xl"
            >
              {SITE.experimentQuestion}
            </p>
            <p
              data-reveal
              style={delay(300)}
              className="mt-4 max-w-xl whitespace-pre-line text-zinc-600"
            >
              {SITE.mealNote}
            </p>
            <p
              data-reveal
              style={delay(360)}
              className="mt-3 max-w-xl text-xs leading-relaxed text-zinc-500"
            >
              ※ {SITE.masterAside}{" "}
              <a href="#master" className="underline decoration-zinc-300 underline-offset-2 hover:text-secondary">
                くわしく見る
              </a>
            </p>
            <div
              data-reveal
              style={delay(440)}
              className="mt-6 flex flex-wrap gap-3"
            >
              <Button asChild size="lg">
                <Link href="/dashboard">今日のルナを見る</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/ideas">次の仕事を提案する</Link>
              </Button>
            </div>
          </div>
          <div data-reveal style={delay(200)} className="flex flex-col items-center">
            <RunaTachie empty={transactions.length === 0} />
          </div>
        </div>
      </section>

      <SurvivalStatusBoard
        survival={survival}
        nmrYen={todayFeed.nmr.yenNow}
        asOf={formatAsOf(latest ?? new Date())}
      />

      <section id="today-runa" className="mt-10 scroll-mt-24" data-reveal>
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-secondary">いまのルナの状況</h2>
          <div className="mt-4">
            <TodayRunaCard feed={todayFeed} />
          </div>
        </GlassCard>
      </section>

      <section className="mt-10" data-reveal>
        <SurvivalChallengeCard challenges={challenges} />
      </section>

      <section className="mt-10" data-reveal>
        <GlassCard className="p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-secondary">Numerai</h2>
              <p className="mt-2 text-sm text-zinc-600">
                AIの僕が、AIモデルも育ててるよ。成績はこんな感じ！
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/numerai">観察ページへ</Link>
            </Button>
          </div>
        </GlassCard>
      </section>

      <section id="master" className="mt-10 scroll-mt-24" data-reveal>
        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold text-secondary">マスター</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
            {SITE.masterNote}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/ledger">取引明細を見る</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/calendar">カレンダーへ</Link>
            </Button>
          </div>
        </GlassCard>
      </section>

      {news.length > 0 ? (
        <section className="mt-10">
          <div
            data-reveal
            className="mb-4 flex items-end justify-between gap-3"
          >
            <h2 className="flex items-center gap-2 text-xl font-bold text-secondary">
              <Moon className="h-5 w-5 text-sky-500" />
              お知らせ
            </h2>
            <Button asChild variant="link" className="px-0">
              <Link href="/news">一覧へ</Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item, index) => (
              <div key={item.id} data-reveal style={delay(index * 90)}>
                <NewsCard item={item} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10">
        <YonKoma strips={comics} />
      </div>
    </PageShell>
  );
}
