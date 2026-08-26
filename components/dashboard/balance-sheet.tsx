import { formatYen } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BalanceSheet as BalanceSheetData } from "@/types/domain";

const COLORS = {
  cash: "#5ec4b6",
  equipment: "#0f9d8a",
  nmr: "#6366f1",
  loan: "#f08080",
  equity: "#3b82f6",
  nmrGain: "#818cf8",
} as const;

type Block = {
  key: string;
  label: string;
  amount: number;
  color: string;
};

function SheetColumn({
  title,
  total,
  blocks,
  scale,
}: {
  title: string;
  total: number;
  blocks: Block[];
  scale: number;
}) {
  const visible = blocks.filter((block) => block.amount > 0);
  return (
    <div className="flex min-h-[180px] flex-col sm:min-h-[220px]">
      <p className="mb-2 text-sm font-medium text-zinc-500">{title}</p>
      <div className="flex min-h-[140px] flex-1 flex-col overflow-hidden rounded-2xl sm:min-h-[180px]">
        {visible.length === 0 ? (
          <div className="flex flex-1 items-center justify-center bg-zinc-50 text-sm text-zinc-400">
            0円
          </div>
        ) : (
          visible.map((block) => {
            const share = scale > 0 ? block.amount / scale : 0;
            const compact = share < 0.12;
            return (
              <div
                key={block.key}
                className={cn(
                  "flex px-2 text-white sm:px-4",
                  compact
                    ? "min-h-9 items-center justify-between sm:min-h-10"
                    : "min-h-16 flex-col items-center justify-center text-center sm:min-h-24"
                )}
                style={{
                  flexGrow: Math.max(block.amount, 1),
                  background: block.color,
                }}
              >
                <p className={cn("font-medium", compact ? "text-xs sm:text-sm" : "text-sm sm:text-base")}>
                  {block.label}
                </p>
                <p
                  className={cn(
                    "tabular-nums font-semibold tracking-tight",
                    compact ? "text-xs sm:text-sm" : "mt-0.5 text-lg sm:mt-1 sm:text-2xl"
                  )}
                >
                  {formatYen(block.amount)}
                </p>
              </div>
            );
          })
        )}
      </div>
      <p className="mt-2 text-sm tabular-nums text-zinc-500">
        合計 {formatYen(total)}
      </p>
    </div>
  );
}

export function BalanceSheetView({
  sheet,
  nmrYen = null,
}: {
  sheet: BalanceSheetData;
  nmrYen?: number | null;
}) {
  const nmr = nmrYen !== null && nmrYen > 0 ? Math.round(nmrYen) : 0;
  const assetBlocks: Block[] = [
    { key: "cash", label: "流動資産 現金", amount: sheet.cash, color: COLORS.cash },
    {
      key: "equipment",
      label: "固定資産 機材",
      amount: sheet.equipment,
      color: COLORS.equipment,
    },
    {
      key: "nmr",
      label: "投資その他 NMR（時価）",
      amount: nmr,
      color: COLORS.nmr,
    },
  ];
  const rightBlocks: Block[] = [
    {
      key: "loan",
      label: "固定負債 マスター借入",
      amount: sheet.loan,
      color: COLORS.loan,
    },
    {
      key: "equity",
      label: "純資産 累計収支",
      amount: Math.max(sheet.equity, 0),
      color: COLORS.equity,
    },
    {
      key: "nmr-gain",
      label: "純資産 NMR評価差額",
      amount: nmr,
      color: COLORS.nmrGain,
    },
  ];
  const assetTotal = sheet.assets + nmr;
  const rightTotal = sheet.loan + sheet.equity + nmr;
  const scale = Math.max(assetTotal, sheet.loan + Math.max(sheet.equity, 0) + nmr, 1);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <SheetColumn
          title="資産"
          total={assetTotal}
          blocks={assetBlocks}
          scale={scale}
        />
        <SheetColumn
          title="負債・純資産"
          total={rightTotal}
          blocks={rightBlocks}
          scale={scale}
        />
      </div>
      {nmrYen === null ? (
        <p className="mt-3 text-sm text-zinc-500">
          NMRの円はいま取れなかったよ。帳簿の左右は、現金と機材だけで合ってるよ。
        </p>
      ) : nmr > 0 ? (
        <p className="mt-3 text-sm text-zinc-500">
          NMRはいまの時価だよ。未確定のPayoutは収入に入れてないよ。
        </p>
      ) : null}
      {sheet.equity < 0 ? (
        <p className="mt-3 text-sm text-rose-600">
          純資産 {formatYen(sheet.equity)}。累計ではまだ赤字だよ。
        </p>
      ) : null}
    </div>
  );
}
