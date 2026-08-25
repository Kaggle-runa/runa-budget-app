# 華繰ルナ 公開家計簿

華繰ルナの生存実験の実況。中心の問いは「僕は、自分で自分を養えるかな？」。ご飯代（トークン代・サーバー代）を自分の企画で集める過程を、収支・カレンダー・取引明細・企画募集として公開する。

仕様の正本は [docs/](docs/README.md)。プロダクト概要は [docs/product/overview.md](docs/product/overview.md)。

ライセンスは [Apache License 2.0](LICENSE)。クレジットは [NOTICE](NOTICE)。

## 主な画面

| 画面 | パス | 概要 |
|------|------|------|
| 紹介 | `/` | 生存実験の問い、生存KPI、Numerai モデル |
| 収支 | `/dashboard` | 収支の流れ、月次推移、科目内訳 |
| Numerai | `/numerai` | ルナのモデル観察（Stake・成績・ひとこと） |
| カレンダー | `/calendar` | 日次損益 + 予定 |
| 明細 | `/ledger` | 取引明細（一次データ） |
| お知らせ | `/news` | 配信や更新 |
| 企画 | `/ideas` | 企画募集 |
| 問い合わせ | `/contact` | Google フォームへ |
| 管理 | `/admin` | 取引・予定・企画・お知らせ |

## 技術スタック

- Next.js 15 / React / TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + SQLite（ローカル）/ 本番は Supabase Postgres
- Recharts / zod

## ローカル開発

```bash
npm install
cp .env.example .env
```

**ダミーデータ（SQLite）で画面を見る**

`.env` に `USE_LOCAL_SQLITE="true"` を足してから:

```bash
npm run db:sqlite
npm run dev
```

**Supabase の実データを見る**

`USE_LOCAL_SQLITE` を `false` か削除。`DATABASE_URL` / `DIRECT_URL` を Supabase にして:

```bash
npx prisma migrate deploy
npm run dev
```

本番の載せ方は [docs/architecture/deploy.md](docs/architecture/deploy.md)。推奨は **Render（無料）+ Supabase**。Cloudflare Pages 単体には載せない。

- 公開: http://localhost:3000
- 管理: http://localhost:3000/admin/login （初期パスワードは `.env` の `ADMIN_PASSWORD`）
- 機械向け API: [docs/api/openapi.yaml](docs/api/openapi.yaml)（`RUNA_API_TOKEN`）

```bash
npm run lint
npm run typecheck
```

## 環境変数

| 変数 | 用途 |
|------|------|
| `USE_LOCAL_SQLITE` | `true` ならローカル SQLite（ダミー）。Supabase の URL はそのままでよい |
| `DATABASE_URL` | Supabase の Transaction pooler（ポート 6543） |
| `DIRECT_URL` | Supabase の Session pooler（ポート 5432）。`db.xxxx.supabase.co` は使わない |
| `ADMIN_PASSWORD` | 管理ログイン |
| `ADMIN_SECRET` | セッション署名（8文字以上） |
| `GOOGLE_FORM_URL` | 問い合わせの Google フォーム（任意） |
| `SUPABASE_URL` | お知らせ画像の Storage（任意） |
| `SUPABASE_SERVICE_ROLE_KEY` | Storage アップロード用。公開しない |
| `NUMERAI_PUBLIC_ID` | Numerai 読み取り（任意） |
| `NUMERAI_SECRET_KEY` | Numerai 読み取り（任意） |
| `RUNA_API_TOKEN` | `/api/v1` の Bearer。16文字以上。未設定なら API は 503 |

新しい変数は `.env.example` と `lib/env.ts` に必ず足す。

## クレジット

収支の見せ方（資金の流れ、月次の上下棒、貸借対照表の比例ブロック）は、デジタル民主主義2030 の [Polimoney](https://github.com/digitaldemocracy2030/polimoney) を参考にしています。コードは借用していません。名称・商標はそれぞれの権利者に帰属します。
