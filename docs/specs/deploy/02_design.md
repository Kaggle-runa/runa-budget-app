# 設計: デプロイ

## 構成

Next.js 1プロセス + Supabase Postgres。詳細は `docs/architecture/deploy.md`。

## 環境変数

| 変数 | 用途 |
|------|------|
| `DATABASE_URL` | Prisma 実行（pooler） |
| `DIRECT_URL` | migrate / db push |
| `ADMIN_PASSWORD` | 管理ログイン |
| `ADMIN_SECRET` | Cookie 署名 |

## コンポーネント

コード追加は最小。ホスト側の設定が本体。`render.yaml` が Render Blueprint。
