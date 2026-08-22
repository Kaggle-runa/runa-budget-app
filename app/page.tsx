import Link from "next/link";
import { BookOpen, Moon, Star } from "lucide-react";
import { GlassCard } from "@/components/layout/glass-card";
import { PageShell } from "@/components/layout/page-shell";
import { Wordmark } from "@/components/layout/wordmark";
import { RunaTachie } from "@/components/motion/runa-tachie";
import { YonKoma } from "@/components/motion/yon-koma";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/news/news-card";
import { SITE } from "@/lib/constants";
import { formatAsOf, formatYen } from "@/lib/format";
import { summarizeKpis } from "@/lib/finance";
import { getLatestUpdatedAt, listAnnouncements, listTransactions } from "@/lib/queries";

export default async function HomePage() {
  const [transactions, latest, news] = await Promise.all([
    listTransactions(),
    getLatestUpdatedAt(),
    listAnnouncements({ publishedOnly: true, take: 3 }),
  ]);
  const kpi = summarizeKpis(transactions);

  return (
    <PageShell currentPath="/">
      <section className="hero-stage reveal">
        <div className="relative z-10 grid items-center gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm text-sky-700 ring-1 ring-sky-200 animate-float-y">
              <Moon className="h-4 w-4" />
              ルナの{SITE.nickname}
              <Star className="h-3.5 w-3.5 fill-amber-200 text-amber-400" />
            </p>
            <h1 className="sr-only">{SITE.name}</h1>
            <Wordmark size="hero" priority />
            <p className="mt-1 text-sm text-sky-700/70">{SITE.reading}</p>
            <p className="reveal reveal-1 mt-4 text-lg text-secondary">
              {SITE.tagline}
            </p>
            <p className="reveal reveal-2 mt-3 max-w-xl text-zinc-600">
              {SITE.description}
            </p>
            <p className="reveal reveal-2 mt-2 font-display text-sm text-sky-700">
              {SITE.catchphrase}
            </p>
            <div className="reveal reveal-3 mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">収支を見る</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/ideas">企画を送る</Link>
              </Button>
            </div>
          </div>
          <div className="reveal reveal-2 flex flex-col items-center">
            <RunaTachie empty={transactions.length === 0} />
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <GlassCard className="reveal reveal-2 p-5">
          <p className="text-sm text-sky-700/80">現金残高（円）</p>
          <p
            className={`mt-2 text-3xl font-semibold animate-pop-in ${kpi.balance >= 0 ? "text-accent" : "text-rose-600"}`}
          >
            {formatYen(kpi.balance)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {latest ? formatAsOf(latest) : kpi.asOf}
          </p>
        </GlassCard>
        <GlassCard className="reveal reveal-3 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-secondary">
            <BookOpen className="h-4 w-4 text-sky-500" />
            今日の見どころ
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            カレンダーだと、配信の日と収支が同じマスに重なるよ。数字、一緒に見てみない？
          </p>
          <Button asChild variant="link" className="px-0">
            <Link href="/calendar">カレンダーへ</Link>
          </Button>
        </GlassCard>
        <GlassCard className="reveal reveal-4 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-secondary">
            <Star className="h-4 w-4 fill-amber-200 text-amber-400" />
            君の企画
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            つぎのお仕事は君の企画から選ぶよ。採用したら帳簿にも載せるね。
          </p>
          <Button asChild variant="link" className="px-0">
            <Link href="/ideas">企画一覧へ</Link>
          </Button>
        </GlassCard>
      </section>

      {news.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-secondary">
              <Moon className="h-5 w-5 text-sky-500" />
              お知らせ
            </h2>
            <Button asChild variant="link" className="px-0">
              <Link href="/news">一覧へ</Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10">
        <YonKoma />
      </div>
    </PageShell>
  );
}
