import { formatYen } from "@/lib/format";
import { cn } from "@/lib/utils";

export function KpiStrip({
  incomeTotal,
  expenseTotal,
  net,
}: {
  incomeTotal: number;
  expenseTotal: number;
  net: number;
}) {
  const items = [
    {
      key: "income",
      label: "収入総額（円）",
      value: incomeTotal,
      className: "text-teal-600",
    },
    {
      key: "expense",
      label: "支出総額（円）",
      value: expenseTotal,
      className: "text-rose-600",
    },
    {
      key: "net",
      label: "収支（円）",
      value: net,
      className: net >= 0 ? "text-zinc-900" : "text-rose-600",
    },
  ] as const;

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-2xl bg-zinc-50 px-4 py-4 ring-1 ring-inset ring-zinc-100"
        >
          <p className="text-sm text-zinc-500">{item.label}</p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold tracking-tight",
              item.className
            )}
          >
            {formatYen(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
