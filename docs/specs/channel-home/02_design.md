# 設計: チャンネルトップ

## 画面構成

| パス | 画面 | 概要 |
|------|------|------|
| `/` | ヒーロー（問い＋ご飯代＋CTA）→ 総資産 → いまのルナの状況 → 現在の挑戦 → Numerai入口 → マスター → お知らせ → 4コマ | Server Component |

順序（スマホ 1〜2スクロールを優先）:

1. 企画の問い
2. ご飯代の短い説明
3. 総資産（現金 / NMR / 機材）と今月の生存ラベル
4. 今日何が起きたか
5. いまの挑戦（空なら募集）
6. CTA（ヒーローにも置く）

そのあと Numerai / マスター / お知らせ / 4コマ / 自己紹介（フッター）。

## コンポーネント

`app/page.tsx` が `PageShell` と生存ボードを組み立てる。コピーは `lib/constants.ts`。
生存KPIは `lib/survival.ts`、UI は `components/survival/`。
いまのルナの状況は `components/dashboard/today-runa.tsx`。お仕事と NMR を分け、「今日の資産増減」は仕事の収支 + NMR 評価額の前日比。

ヒーローCTA: 「今日のルナを見る」→ `/dashboard`、「次の仕事を提案する」→ `/ideas`。
現在の挑戦は進行中を複数出せる。これまでの結果は `/ideas#past` へ。
マスター注釈は `#master` へ。
