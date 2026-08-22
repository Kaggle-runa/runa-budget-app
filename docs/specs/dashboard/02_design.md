# 設計: 収支ダッシュボード

| パス | 画面 |
|------|------|
| `/dashboard` | 収支の流れ + 月次 + 内訳 |

集計は `lib/finance.ts`（`cashFlowGraph` / `monthlySeriesForYear`）。
カードは `DashCard`。サンキーは `components/dashboard/cash-flow-sankey.tsx`。
