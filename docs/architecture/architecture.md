# 技術構成

## スタック

- Next.js 15（App Router）/ React 18 / TypeScript
- Tailwind CSS 3 + shadcn/ui（new-york）
- Prisma + Supabase Postgres
- Recharts（棒・ドーナツ）
- zod（環境変数と Server Action 入力）
- パッケージ管理: npm

## アプリの種別

公開サイト + 管理者のみパスワード認証。視聴者アカウントは持たない。

## デザイン

llm-game の kawaii-tech（ピンク / 紫 / シアン、ガラスカード、splash-bg）を踏襲。
ダークモードは作らない。トークンは `app/globals.css`。

## 認証

- `ADMIN_PASSWORD` と照合
- `ADMIN_SECRET` で HMAC-SHA256 署名した httpOnly Cookie（7日）
- `middleware.ts` が `/admin/*`（`/admin/login` 以外）を保護
- 各 Server Action でも `requireAdmin()` する

## 更新の見え方

管理者が保存したら `revalidatePath` で公開ページを更新し、「YYYY.M.D時点」を出す。
WebSocket は第2版。

## 環境変数

`lib/env.ts` の `getEnv()` 経由でのみ参照する。一覧は `.env.example`。
本番の載せ方は `docs/architecture/deploy.md`。
