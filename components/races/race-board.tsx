import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DashSectionHeader } from "@/components/dashboard/section-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { formatSignedYen, formatYen } from "@/lib/format";
import { shiftMonth, type RaceGroupTotals } from "@/lib/races/summary";
import {
  hitLabel,
  SPORT_LABEL,
  type RaceDayTotals,
  type RaceSport,
  type RaceTicketDTO,
  type RaceTotals,
} from "@/lib/races/types";
import { cn } from "@/lib/utils";

function recoveryText(rate: number | null): string {
  if (rate === null) return "—";
  return `${rate.toFixed(1)}%`;
}

function monthLabel(month: string): string {
  const [year, mon] = month.split("-");
  return `${year}年${Number(mon)}月`;
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

function racesHref(input: {
  sport?: string;
  month?: string;
  day?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (input.sport) params.set("sport", input.sport);
  if (input.month) params.set("month", input.month);
  if (input.day) params.set("day", input.day);
  if (input.page && input.page > 1) params.set("page", String(input.page));
  const query = params.toString();
  return query ? `/races?${query}` : "/races";
}

export function RaceBoard({
  tickets,
  totalTickets,
  page,
  pages,
  pageStart,
  pageEnd,
  pageSize,
  cash,
  sport,
  month,
  day,
  months,
  days,
  monthRows,
  betTypes,
  totals,
  hasAny,
}: {
  tickets: RaceTicketDTO[];
  totalTickets: number;
  page: number;
  pages: number;
  pageStart: number;
  pageEnd: number;
  pageSize: number;
  cash: number;
  sport: "" | RaceSport;
  month: string;
  day: string;
  months: string[];
  days: RaceDayTotals[];
  monthRows: RaceGroupTotals[];
  betTypes: RaceGroupTotals[];
  totals: RaceTotals;
  hasAny: boolean;
}) {
  const previous = month !== "all" ? shiftMonth(month, -1) : null;
  const next = month !== "all" ? shiftMonth(month, 1) : null;
  const periodLabel = day ? day : month === "all" ? "全期間" : month ? monthLabel(month) : "—";

  return (
    <div className="space-y-8">
      <DashSectionHeader
        title="レース"
        description="競艇と競馬の結果だよ。月を選んで見てね。いまの残高は家計の現金で、購入と払戻はそこに繋いであるよ。"
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
          <span className="text-xs text-muted-foreground">月</span>
          <input
            type="month"
            name="month"
            defaultValue={month === "all" ? "" : month}
            className="flex h-9 rounded-md border border-input bg-white px-3 text-sm"
          />
        </label>
        <Button type="submit" size="sm">
          この月を見る
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={racesHref({ sport, month: "all" })}>全期間</Link>
        </Button>
      </form>

      {months.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {month !== "all" && previous ? (
            <Link
              href={racesHref({ sport, month: previous })}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-input bg-white px-3 text-sm text-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
              前の月
            </Link>
          ) : null}
          <p className="px-2 text-sm font-semibold text-zinc-800">{periodLabel}</p>
          {month !== "all" && next ? (
            <Link
              href={racesHref({ sport, month: next })}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-input bg-white px-3 text-sm text-secondary"
            >
              次の月
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {months.map((item) => (
              <Link
                key={item}
                href={racesHref({ sport, month: item })}
                className={cn(
                  "rounded-full px-3 py-1 text-xs",
                  item === month
                    ? "bg-sky-100 text-sky-800"
                    : "border border-zinc-200 bg-white text-zinc-600"
                )}
              >
                {monthLabel(item)}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-sm text-sky-700/80">いまの残高</dt>
          <dd className="mt-1 text-3xl font-semibold tabular-nums text-accent">
            {formatYen(cash)}
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">家計の現金だよ</p>
        </div>
        <div>
          <dt className="text-sm text-sky-700/80">
            {day ? "この日の収支" : month === "all" ? "全期間の収支" : "この月の収支"}
          </dt>
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
      ) : totalTickets === 0 ? (
        <EmptyState
          title="この月のレースは無いよ"
          description="別の月を選ぶか、全期間を見てみてね。"
        />
      ) : (
        <>
          <section>
            <h3 className="mb-3 text-base font-bold text-zinc-900">券種別の回収率</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-zinc-50 text-left text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">券種</th>
                    <th className="px-4 py-3 text-right font-medium">購入</th>
                    <th className="px-4 py-3 text-right font-medium">払戻</th>
                    <th className="px-4 py-3 text-right font-medium">収支</th>
                    <th className="px-4 py-3 text-right font-medium">回収率</th>
                    <th className="px-4 py-3 text-right font-medium">的中</th>
                  </tr>
                </thead>
                <tbody>
                  {betTypes.map((row) => (
                    <tr key={row.key} className="border-t border-zinc-100">
                      <td className="px-4 py-3">{row.key}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatYen(row.stakeYen)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatYen(row.payoutYen)}</td>
                      <td className="px-4 py-3 text-right">
                        <Signed amount={row.netYen} />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {recoveryText(row.recoveryPercent)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {row.hits}/{row.tickets}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {month === "all" ? (
            <section>
              <h3 className="mb-3 text-base font-bold text-zinc-900">月別の収支</h3>
              <PeriodTable
                rows={monthRows.map((row) => ({
                  key: row.key,
                  label: monthLabel(row.key),
                  href: racesHref({ sport, month: row.key }),
                  stakeYen: row.stakeYen,
                  payoutYen: row.payoutYen,
                  netYen: row.netYen,
                  recoveryPercent: row.recoveryPercent,
                  hits: row.hits,
                  tickets: row.tickets,
                }))}
              />
            </section>
          ) : (
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-zinc-900">日次の収支</h3>
                {day ? (
                  <Link
                    href={racesHref({ sport, month })}
                    className="text-sm text-secondary hover:underline"
                  >
                    月の一覧に戻る
                  </Link>
                ) : null}
              </div>
              <PeriodTable
                rows={days.map((row) => ({
                  key: row.date,
                  label: row.date,
                  href: racesHref({ sport, month, day: row.date }),
                  selected: row.date === day,
                  stakeYen: row.stakeYen,
                  payoutYen: row.payoutYen,
                  netYen: row.netYen,
                  recoveryPercent: row.recoveryPercent,
                  hits: row.hits,
                  tickets: row.tickets,
                }))}
              />
            </section>
          )}

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-zinc-900">レース一覧</h3>
              <p className="text-sm text-zinc-500">
                {pageStart + 1}–{pageEnd} / {totalTickets}件
              </p>
            </div>
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
            {pages > 1 ? (
              <div className="mt-4 flex items-center justify-end gap-2">
                {page > 1 ? (
                  <Link
                    href={racesHref({ sport, month, day, page: page - 1 })}
                    className="rounded-md border border-input bg-white px-3 py-1.5 text-sm text-secondary"
                  >
                    前の{pageSize}件
                  </Link>
                ) : (
                  <span className="rounded-md px-3 py-1.5 text-sm text-zinc-300">前の{pageSize}件</span>
                )}
                <span className="text-sm tabular-nums text-zinc-500">
                  {page} / {pages}
                </span>
                {page < pages ? (
                  <Link
                    href={racesHref({ sport, month, day, page: page + 1 })}
                    className="rounded-md border border-input bg-white px-3 py-1.5 text-sm text-secondary"
                  >
                    次の{pageSize}件
                  </Link>
                ) : (
                  <span className="rounded-md px-3 py-1.5 text-sm text-zinc-300">次の{pageSize}件</span>
                )}
              </div>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}

function PeriodTable({
  rows,
}: {
  rows: {
    key: string;
    label: string;
    href: string;
    selected?: boolean;
    stakeYen: number;
    payoutYen: number;
    netYen: number;
    recoveryPercent: number | null;
    hits: number;
    tickets: number;
  }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">期間</th>
            <th className="px-4 py-3 text-right font-medium">購入</th>
            <th className="px-4 py-3 text-right font-medium">払戻</th>
            <th className="px-4 py-3 text-right font-medium">収支</th>
            <th className="px-4 py-3 text-right font-medium">回収率</th>
            <th className="px-4 py-3 text-right font-medium">的中</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              className={cn("border-t border-zinc-100", row.selected && "bg-sky-50")}
            >
              <td className="px-4 py-3">
                <Link href={row.href} className="text-secondary hover:underline">
                  {row.label}
                </Link>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{formatYen(row.stakeYen)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatYen(row.payoutYen)}</td>
              <td className="px-4 py-3 text-right">
                <Signed amount={row.netYen} />
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {recoveryText(row.recoveryPercent)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {row.hits}/{row.tickets}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
