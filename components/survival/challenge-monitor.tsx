import Link from "next/link";
import { signedLedgerAmount } from "@/lib/finance";
import { formatSignedYen, formatYen } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ChallengePl, TransactionDTO } from "@/types/domain";

function MoneyRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "plus" | "minus";
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "tabular-nums",
          tone === "plus" && "font-semibold text-accent",
          tone === "minus" && "font-semibold text-rose-600",
          !tone && "font-medium"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function ChallengeMonitor({
  challenge,
  transactions = [],
}: {
  challenge: ChallengePl;
  transactions?: TransactionDTO[];
}) {
  const earnedTone =
    challenge.earned > 0 ? "plus" : challenge.earned < 0 ? "minus" : undefined;
  const related = transactions.filter((tx) => tx.projectId === challenge.projectId);

  return (
    <div>
      <dl className="grid grid-cols-3 gap-2 text-sm">
        <MoneyRow label="収益" value={formatYen(challenge.income)} />
        <MoneyRow label="トークン代" value={formatYen(challenge.tokenCost)} />
        <MoneyRow
          label="稼いだ金額"
          value={formatSignedYen(challenge.earned)}
          tone={earnedTone}
        />
      </dl>
      {challenge.otherExpense > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          その他経費 {formatYen(challenge.otherExpense)} / 最終収支{" "}
          {formatSignedYen(challenge.pl)}
        </p>
      ) : null}
      {challenge.masterNote ? (
        <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-sm text-zinc-700">
          <span className="font-medium text-secondary">マスターの介入：</span>
          {challenge.masterNote}
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          この挑戦では、まだマスターに頼ってないよ。
        </p>
      )}
      {related.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">この企画の明細</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {related.slice(0, 8).map((tx) => (
              <li key={tx.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate text-zinc-700">
                  {tx.date} {tx.title}
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatSignedYen(signedLedgerAmount(tx))}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={`/ledger?project=${challenge.projectId}`}
            className="mt-2 inline-block text-xs text-secondary underline"
          >
            この企画の明細を見る
          </Link>
        </div>
      ) : null}
    </div>
  );
}
