import Link from "next/link";
import { DashSectionHeader } from "@/components/dashboard/section-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { formatSignedYen, formatYen } from "@/lib/format";
import { summarizeDays, summarizeTickets } from "@/lib/races/summary";
import {
  hitLabel,
  SPORT_LABEL,
  type RaceSport,
  type RaceTicketDTO,
} from "@/lib/races/types";
import { cn } from "@/lib/utils";

function recoveryText(rate: number | null): string {
  if (rate === null) return "—";
  return `${rate.toFixed(1)}%`;
}

function Signed({ amount }: { amount: number }) {
  return (
    <span
      className={cn(
        "tabular-nums",
        amount > 0 && "text-accent",
        amount < 0 && "text-primary"
      )}
    >
      {formatSignedYen(amount)}
    </span>
  );
}

function racesHref(input: { sport?: string; from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (input.sport) params.set("sport", input.sport);
  if (input.from) params.set("from", input.from);
  if (input.to) params.set("to", input.to);
  const query = params.toString();
  return query ? `/races?${query}` : "/races";
}

export function RaceBoard({
  tickets,
  cash,
  sport,
  from,
  to,
  hasAny,
}: {
  tickets: RaceTicketDTO[];
  cash: number;
  sport: "" | RaceSport;
  from: string;
  to: string;
  hasAny: boolean;
}) {
  const totals = summarizeTickets(tickets);
  const days = summarizeDays(tickets);

  return (
    <div className="space-y-8">
      <DashSectionHeader
        title="レース"
        description="競艇と競馬の結果だよ。いまの残高は家計の現金で、購入と払戻はそこに繋いであるよ。買い方は案内しないよ。"
      />

      <form method="get" action="/races" className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">
          <span className="text-xs text-muted-foreground">種目</span>
          <select
            name="sport"
            defaultValue={sport}
            className="flex h-9 min-w-[8rem] rounded-md border border-input bg-white px-3 text-sm"
          >
            <option value="">すべて</option>
            <option value="kyotei">競艇</option>
            <option value="keiba">競馬</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs text-muted-foreground">から</span>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="flex h-9 rounded-md border border-input bg-white px-3 text-sm"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs text-muted-foreground">まで</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="flex h-9 rounded-md border border-input bg-white px-3 text-sm"
          />
        </label>
        <Button type="submit" size="sm">
          絞り込む
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/races">全期間</Link>
        </Button>
      </form>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-sm text-sky-700/80">いまの残高</dt>
          <dd className="mt-1 text-3xl font-semibold tabular-nums text-accent">
            {formatYen(cash)}
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">家計の現金だよ</p>
        </div>
        <div>
          <dt className="text-sm text-sky-700/80">この期間の収支</dt>
          <dd className="mt-1 text-3xl font-semibold">
            <Signed amount={totals.netYen} />
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">
            購入 {formatYen(totals.stakeYen)} / 払戻 {formatYen(totals.payoutYen)}
          </p>
        </div>
        <div>
          <dt className="text-sm text-sky-700/80">回収率</dt>
          <dd className="mt-1 text-3xl font-semibold tabular-nums text-zinc-800">
            {recoveryText(totals.recoveryPercent)}
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">払戻 ÷ 購入</p>
        </div>
        <div>
          <dt className="text-sm text-sky-700/80">的中</dt>
          <dd className="mt-1 text-3xl font-semibold tabular-nums text-zinc-800">
            {totals.hits}
            <span className="text-lg text-zinc-500"> / {totals.tickets}</span>
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">レース {totals.races}</p>
        </div>
      </dl>

      {!hasAny ? (
        <EmptyState
          title="まだレースが無いよ"
          description="競艇のCSVか、APIから買い目が入るとここに出るよ。"
        />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="この条件のレースは無いよ"
          description="種目や日付を変えるか、全期間に戻してみてね。"
        />
      ) : (
        <>
          <section>
            <h3 className="mb-3 text-base font-bold text-zinc-900">日次の収支</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-zinc-50 text-left text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">日付</th>
                    <th className="px-4 py-3 text-right font-medium">購入</th>
                    <th className="px-4 py-3 text-right font-medium">払戻</th>
                    <th className="px-4 py-3 text-right font-medium">収支</th>
                    <th className="px-4 py-3 text-right font-medium">回収率</th>
                    <th className="px-4 py-3 text-right font-medium">的中</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day.date} className="border-t border-zinc-100">
                      <td className="px-4 py-3">
                        <Link
                          href={racesHref({ sport, from: day.date, to: day.date })}
                          className="text-secondary hover:underline"
                        >
                          {day.date}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatYen(day.stakeYen)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatYen(day.payoutYen)}</td>
                      <td className="px-4 py-3 text-right">
                        <Signed amount={day.netYen} />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {recoveryText(day.recoveryPercent)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {day.hits}/{day.tickets}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-base font-bold text-zinc-900">レース一覧</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-sm">
                <thead className="bg-zinc-50 text-left text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">日付</th>
                    <th className="px-4 py-3 font-medium">種目</th>
                    <th className="px-4 py-3 font-medium">場</th>
                    <th className="px-4 py-3 font-medium">R</th>
                    <th className="px-4 py-3 font-medium">勝式</th>
                    <th className="px-4 py-3 font-medium">組番</th>
                    <th className="px-4 py-3 text-right font-medium">購入</th>
                    <th className="px-4 py-3 font-medium">的中</th>
                    <th className="px-4 py-3 text-right font-medium">払戻</th>
                    <th className="px-4 py-3 text-right font-medium">収支</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-t border-zinc-100">
                      <td className="px-4 py-3 tabular-nums">{ticket.date}</td>
                      <td className="px-4 py-3">{SPORT_LABEL[ticket.sport]}</td>
                      <td className="px-4 py-3">{ticket.venue}</td>
                      <td className="px-4 py-3">{ticket.race}</td>
                      <td className="px-4 py-3">{ticket.betType}</td>
                      <td className="px-4 py-3 tabular-nums">{ticket.selection}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatYen(ticket.stakeYen)}</td>
                      <td className="px-4 py-3">{hitLabel(ticket.hitStatus)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatYen(ticket.payoutYen)}</td>
                      <td className="px-4 py-3 text-right">
                        <Signed amount={ticket.netYen} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
