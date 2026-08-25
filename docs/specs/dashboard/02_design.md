# 設計: 収支ダッシュボード

| パス | 画面 |
|------|------|
| `/dashboard` | いまのルナの状況 + 今月の運営 + 貸借対照表 + 収支の流れ + 月次 + 内訳 |

集計は `lib/finance.ts`（`cashFlowGraph` / `monthlySeriesForYear`）。
当日フィードは `lib/today-runa.ts`。Stake は `v3UserProfile.stakeValue`（NMR）。円は NMR × 価格 × ドル円。CORR は出さない。
カードは `DashCard`。サンキーは `components/dashboard/cash-flow-sankey.tsx`。
当日フィードはお仕事（売上 / 経費 / 収支）と NMR（現在価値 / 前日比）を並べる。
「今日の資産増減」は お仕事の収支 + NMR評価額の前日比。帳簿の損益には NMR を入れない。
ゼロの日は空欄にせず、ルナのひとことで実況する。
