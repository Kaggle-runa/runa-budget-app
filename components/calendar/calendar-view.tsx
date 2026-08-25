"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { DashSectionHeader } from "@/components/dashboard/section-header";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { DashCard } from "@/components/layout/dash-card";
import { EmptyState } from "@/components/layout/empty-state";
import { AnnouncementBody } from "@/components/news/announcement-body";
import { eventKindLabel } from "@/lib/categories";
import { dateKey, dayNet, signedLedgerAmount, summarizeMonth } from "@/lib/finance";
import {
  formatCompactYen,
  formatDayHeading,
  formatSignedYen,
  formatTimeRange,
  formatYen,
  weekdayTone,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EventDTO, TransactionDTO } from "@/types/domain";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function eventOverlapsDay(event: EventDTO, day: Date) {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);
  return start <= dayEnd && end >= dayStart;
}

function kindClass(kind: string) {
  if (kind === "stream") return "bg-cyan-100 text-cyan-800";
  if (kind === "release") return "bg-purple-100 text-purple-800";
  if (kind === "project") return "bg-pink-100 text-pink-800";
  return "bg-emerald-100 text-emerald-800";
}

export function CalendarView({
  initialYear,
  initialMonth,
  transactions,
  events,
  asOf,
}: {
  initialYear: number;
  initialMonth: number;
  transactions: TransactionDTO[];
  events: EventDTO[];
  asOf?: string;
}) {
  const [cursor, setCursor] = useState(new Date(initialYear, initialMonth - 1, 1));
  const [selected, setSelected] = useState(new Date(initialYear, initialMonth - 1, 1));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const weeks = useMemo(() => {
    const chunks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      chunks.push(days.slice(i, i + 7));
    }
    return chunks;
  }, [days]);

  const txByDay = useMemo(() => {
    const map = new Map<string, TransactionDTO[]>();
    for (const tx of transactions) {
      const list = map.get(tx.date) ?? [];
      list.push(tx);
      map.set(tx.date, list);
    }
    return map;
  }, [transactions]);

  const monthSummary = summarizeMonth(
    transactions,
    cursor.getFullYear(),
    cursor.getMonth() + 1
  );

  const selectedKey = dateKey(selected);
  const selectedTx = txByDay.get(selectedKey) ?? [];
  const selectedEvents = events.filter((event) => eventOverlapsDay(event, selected));
  const selectedIncome = selectedTx
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const selectedExpense = selectedTx
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const selectedNet = selectedIncome - selectedExpense;

  return (
    <div className="space-y-6">
      <DashCard>
        <DashSectionHeader
          title="カレンダー"
          asOf={asOf}
          description="マスの数字はその日の収支。下にその日の取引が出るよ。"
        />
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCursor((value) => addMonths(value, -1))}
            className="rounded-full bg-zinc-50 p-2 text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100"
            aria-label="前の月"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold text-zinc-900">
            {format(cursor, "yyyy年M月", { locale: ja })}
          </h3>
          <button
            type="button"
            onClick={() => setCursor((value) => addMonths(value, 1))}
            className="rounded-full bg-zinc-50 p-2 text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100"
            aria-label="次の月"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <KpiStrip
          incomeTotal={monthSummary.income}
          expenseTotal={monthSummary.expense}
          net={monthSummary.net}
        />

        <div className="grid grid-cols-7 text-center text-xs font-medium">
          {WEEKDAYS.map((label, index) => (
            <div
              key={label}
              className={cn(
                "py-2",
                index === 0 && "text-red-500",
                index === 6 && "text-sky-600"
              )}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {weeks.map((week) => {
            const weekEvents = events.filter((event) =>
              week.some((day) => eventOverlapsDay(event, day))
            );
            return (
              <div key={week[0].toISOString()} className="relative">
                <div className="grid grid-cols-7 gap-1">
                  {week.map((day) => {
                    const key = dateKey(day);
                    const dayTx = txByDay.get(key) ?? [];
                    const net = dayNet(dayTx, key);
                    const inMonth = isSameMonth(day, cursor);
                    const tone = weekdayTone(day);
                    const badges = events
                      .filter((event) => eventOverlapsDay(event, day))
                      .slice(0, 2);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelected(day)}
                        className={cn(
                          "flex min-h-[96px] flex-col rounded-xl border p-1.5 text-left transition sm:min-h-[110px]",
                          isSameDay(day, selected)
                            ? "border-zinc-900 bg-zinc-50"
                            : "border-zinc-100 bg-white hover:border-zinc-300",
                          !inMonth && "opacity-40"
                        )}
                      >
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            tone === "sun" && "text-red-500",
                            tone === "sat" && "text-sky-600"
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        <span
                          className={cn(
                            "my-auto text-center text-[11px] font-medium sm:text-sm",
                            net > 0 && "text-teal-600",
                            net < 0 && "text-rose-600",
                            net === 0 && "text-zinc-400"
                          )}
                        >
                          {dayTx.length > 0 ? formatCompactYen(net) : ""}
                        </span>
                        <div className="mt-auto space-y-0.5">
                          {badges.map((event) => (
                            <span
                              key={event.id}
                              className={cn(
                                "block truncate rounded-full px-1.5 py-0.5 text-[10px]",
                                kindClass(event.kind)
                              )}
                            >
                              {event.title}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {weekEvents.some(
                  (event) => dateKey(event.startAt) !== dateKey(event.endAt)
                ) ? (
                  <div className="pointer-events-none mt-1 hidden gap-1 px-1 sm:flex">
                    {weekEvents
                      .filter(
                        (event) => dateKey(event.startAt) !== dateKey(event.endAt)
                      )
                      .map((event) => {
                        const startIndex = week.findIndex((day) =>
                          eventOverlapsDay(event, day)
                        );
                        const endIndex = [...week]
                          .reverse()
                          .findIndex((day) => eventOverlapsDay(event, day));
                        const last = endIndex === -1 ? startIndex : 6 - endIndex;
                        if (startIndex < 0) return null;
                        return (
                          <div
                            key={`${event.id}-${week[0].toISOString()}`}
                            className={cn("h-1.5 rounded-full", kindClass(event.kind))}
                            style={{
                              marginLeft: `${(startIndex / 7) * 100}%`,
                              width: `${((last - startIndex + 1) / 7) * 100}%`,
                            }}
                          />
                        );
                      })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </DashCard>

      <DashCard>
        <DashSectionHeader
          title={`${formatDayHeading(selected)} の取引`}
          description={`収支 ${formatSignedYen(selectedNet)}。`}
        />
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <DayStat label="収入（円）" value={selectedIncome} tone="plus" />
          <DayStat label="支出（円）" value={selectedExpense} tone="minus" />
          <DayStat label="収支（円）" value={selectedNet} tone="auto" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-medium text-zinc-500">予定</h4>
            {selectedEvents.length === 0 ? (
              <EmptyState title="この日の予定はないよ" />
            ) : (
              <DayEventList events={selectedEvents} />
            )}
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-zinc-500">取引</h4>
            {selectedTx.length === 0 ? (
              <EmptyState title="この日の取引はないよ" />
            ) : (
              <ul className="space-y-2">
                {selectedTx.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between">
                    <span className="text-zinc-800">{tx.title}</span>
                    <span
                      className={
                        tx.type === "income"
                          ? "text-teal-600"
                          : tx.type === "expense"
                            ? "text-rose-600"
                            : "text-zinc-600"
                      }
                    >
                      {formatSignedYen(signedLedgerAmount(tx))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DashCard>
    </div>
  );
}

function DayEventList({ events }: { events: EventDTO[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ul className="space-y-2">
      {events.map((event) => {
        const newsHref =
          event.announcementId && event.announcementPublished
            ? `/news/${event.announcementId}`
            : null;
        const hasDetails = Boolean(event.body || newsHref || event.linkUrl);
        const open = openId === event.id;

        return (
          <li key={event.id} className="border-l-4 border-zinc-900 pl-3">
            {hasDetails ? (
              <button
                type="button"
                onClick={() => setOpenId(open ? null : event.id)}
                className="w-full text-left"
              >
                <p className="text-xs text-zinc-500">
                  {event.allDay
                    ? "終日"
                    : formatTimeRange(
                        new Date(event.startAt),
                        new Date(event.endAt)
                      )}
                </p>
                <p className="font-medium text-zinc-900">
                  {eventKindLabel(event.kind)} / {event.title}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {open ? "とじる" : "詳細を見る"}
                </p>
              </button>
            ) : (
              <div>
                <p className="text-xs text-zinc-500">
                  {event.allDay
                    ? "終日"
                    : formatTimeRange(
                        new Date(event.startAt),
                        new Date(event.endAt)
                      )}
                </p>
                <p className="font-medium text-zinc-900">
                  {eventKindLabel(event.kind)} / {event.title}
                </p>
              </div>
            )}
            {open && hasDetails ? (
              <div className="mt-2 space-y-3 rounded-2xl bg-zinc-50 px-3 py-3 text-sm">
                {event.body ? <AnnouncementBody text={event.body} /> : null}
                <div className="flex flex-col gap-1">
                  {newsHref ? (
                    <Link
                      href={newsHref}
                      className="inline-flex items-center gap-1 font-medium text-secondary underline underline-offset-2"
                    >
                      {event.announcementTitle || "お知らせを見る"}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                  {event.linkUrl ? (
                    <a
                      href={event.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-secondary underline underline-offset-2"
                    >
                      リンクを開く
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function DayStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "plus" | "minus" | "auto";
}) {
  return (
    <div className="rounded-2xl bg-zinc-50 px-4 py-3 ring-1 ring-inset ring-zinc-100">
      <p className="text-sm text-zinc-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold",
          tone === "plus" && "text-teal-600",
          tone === "minus" && "text-rose-600",
          tone === "auto" && (value >= 0 ? "text-zinc-900" : "text-rose-600")
        )}
      >
        {formatYen(value)}
      </p>
    </div>
  );
}
