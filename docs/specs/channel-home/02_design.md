# 設計: チャンネルトップ

## 画面構成

| パス | 画面 | 概要 |
|------|------|------|
| `/` | ヒーロー（問い＋ご飯代）→ 生存KPI → いまのルナの状況 → 現在の挑戦／マスター → お知らせ → 4コマ | Server Component |

## コンポーネント

`app/page.tsx` が `PageShell` と生存ボードを組み立てる。コピーは `lib/constants.ts`。
生存KPIは `lib/survival.ts`、UI は `components/survival/`。
いまのルナの状況は `components/dashboard/today-runa.tsx`。お仕事と NMR を分け、「今日の資産増減」は仕事の収支 + NMR 評価額の前日比。
