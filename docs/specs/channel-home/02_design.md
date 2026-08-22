# 設計: チャンネルトップ

## 画面構成

| パス | 画面 | 概要 |
|------|------|------|
| `/` | ヒーロー + KPI + 入口カード | Server Component |

## コンポーネント

`app/page.tsx` が `PageShell` と `GlassCard` を組み立てる。コピーは `lib/constants.ts`。
