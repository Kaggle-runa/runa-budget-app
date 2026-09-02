# 設計: 収支ダッシュボード

| パス | 画面 |
|------|------|
| `/dashboard` | いまのルナの状況 + 今月の運営 + 貸借対照表 + 収支の流れ + 月次 + 内訳 |

集計は `lib/finance.ts`（`cashFlowGraph` / `monthlySeriesForYear`）。
当日フィードは `lib/today-runa.ts`。Stake は `v3UserProfile.stakeValue`（NMR。未確定ラウンド込み）。円は NMR × 価格 × ドル円。CORR は出さない。旧ウォレットの `availableNmr` は Stake と別。
カードは `DashCard`。サンキーは `components/dashboard/cash-flow-sankey.tsx`。
収支の流れと科目ドーナツは `lib/chart-period.ts` の期間で絞る。今日は日本時間。`ここ1週間` は直近7日、`ここ30日` は直近30日、`ここ1ヶ月` は1ヶ月前の同日から今日。
当日フィードはお仕事（売上 / 経費 / 収支）と NMR（総NMR / Stake中 / 旧ウォレット / 現在価値 / Stake前日比 / 円の前日比）を並べる。Payout/Burn は確定後に Stake 枚数へ入れる。未確定は出さない。
NMR の円の前日比は `NmrDailySnapshot` の円の差。Stake前日比は Stake 枚数の差。昨日が無い初回は円だけ価格の24h変化、Stakeは「—」。
貸借対照表は帳簿（現金 / 機材 / 借入 / 累計収支）に、NMR 時価を資産と評価差額で足す。サンキーには入れない。
「今日の資産増減」は お仕事の収支 + NMR評価額の前日比。帳簿の損益には NMR を入れない。
ゼロの日は空欄にせず、ルナのひとことで実況する。
