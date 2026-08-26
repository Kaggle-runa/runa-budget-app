import { AdminNav } from "@/components/admin/admin-nav";
import { NumeraiRefreshForm } from "@/components/admin/numerai-refresh";
import { GlassCard } from "@/components/layout/glass-card";
import { getNumeraiApiToken } from "@/lib/env";
import { formatYen } from "@/lib/format";
import { formatStakeNmr, getNmrQuote, getNumeraiSnapshot, toYen, totalNmr } from "@/lib/numerai";

export default async function AdminNumeraiPage() {
  const [snapshot, quote] = await Promise.all([
    getNumeraiSnapshot(),
    getNmrQuote(),
  ]);
  const amount = totalNmr(snapshot.models, snapshot.wallet?.availableNmr ?? null);
  const yen =
    amount !== null && quote.usdPrice !== null && quote.usdJpy !== null
      ? toYen(amount * quote.usdPrice, quote.usdJpy)
      : null;
  const hasWalletToken = Boolean(getNumeraiApiToken());

  return (
    <>
      <AdminNav currentPath="/admin/numerai" />
      <h1 className="mb-4 text-2xl font-bold text-secondary">Numerai の取得</h1>
      <GlassCard className="mb-6 p-5">
        <NumeraiRefreshForm lastFetchedAt={snapshot.fetchedAt} />
      </GlassCard>
      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold text-secondary">いま入っている数字</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">取得</dt>
            <dd>{snapshot.ok ? "成功" : "失敗"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">NMR円</dt>
            <dd>{yen === null ? "—" : formatYen(yen)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">未ステークNMR</dt>
            <dd>
              {hasWalletToken
                ? formatStakeNmr(snapshot.wallet?.availableNmr ?? null)
                : "環境変数が未設定です"}
            </dd>
          </div>
          {snapshot.models.map((model) => (
            <div key={model.name}>
              <dt className="text-muted-foreground">{model.name}</dt>
              <dd>{formatStakeNmr(model.nmrStaked)}</dd>
            </div>
          ))}
        </dl>
      </GlassCard>
    </>
  );
}
