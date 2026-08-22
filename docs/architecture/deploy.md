# デプロイ

安く長く無料枠で回すための本番構成。判断の経緯は `docs/adr/0002-supabase-and-cheap-hosting.md`。

## 推奨構成（第1版）

```
視聴者 / 運営
    ↓
Next.js（Render 無料 Web Service）
    ↓
Supabase Postgres
```

記事の「Cloudflare Pages + Cloud Run + TiDB + Redis」は、SPA と API を分けたアプリ向け。
このリポジトリは Next.js 1本なので、**フロントだけ Pages に置く必要はない**。

| 役割 | サービス | 無料の目安 |
|------|----------|------------|
| アプリ | [Render](https://render.com) Web Service | スリープあり。日本からやや遅いことがある |
| DB | [Supabase](https://supabase.com) Free | 500MB 程度。Spending Limit / 課金設定を確認する |
| キャッシュ | 使わない | Cookie セッションのみ |

Cloudflare Pages は帯域無制限で静的サイトには最適。ここへ載せるなら OpenNext で **Workers** に Next 全体を載せる（後述の代替）。

## 1. Supabase

アプリ本体は Prisma 経由で Postgres に繋ぐ。Supabase の Auth / Storage は第1版では使わない。

1. [supabase.com](https://supabase.com) でプロジェクトを作る。リージョンは **Northeast Asia (Tokyo)**
2. Spending Limit / 課金上限を確認する
3. **Connect**（または Project Settings > Database）から接続文字列をコピーする
   - **Transaction pooler**（ポート `6543`）→ `DATABASE_URL`。末尾に `?pgbouncer=true`
   - **Session pooler**（ポート `5432`、ホストは `*.pooler.supabase.com`）→ `DIRECT_URL`。migrate 用
   - `db.xxxx.supabase.co` の Direct は使わない。IPv6 のみのことが多く、Render から届かない（P1001）
4. パスワードに `@` `#` `%` などがあるときは URL エンコードする
5. 本番（Render）の Environment に `DATABASE_URL` / `DIRECT_URL` を入れる
6. ローカルでダミー画面だけ見たいときは `.env` に `USE_LOCAL_SQLITE="true"` を足して `npm run db:sqlite`。Supabase の URL は消さなくてよい
7. ローカルから Supabase を見るときは `USE_LOCAL_SQLITE` を外す

```bash
npx prisma migrate deploy   # Supabase にテーブルを作る
npm run db:seed             # 今向いている DB にデモを入れる。本番の実データがあるときは走らせない
npm run db:sqlite           # ローカル SQLite だけ消してダミーを入れ直す
npm run dev
```

`npm run db:reset` は SQLite 用。Supabase は消さない。

## 2. Render（推奨）

1. GitHub にこのリポジトリを push する
2. Render で New > Web Service > リポジトリを選択
3. 設定
   - Runtime: Node
   - Build: `npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`
   - Start: `npm start`
   - Instance: Free
4. Environment
   - `DATABASE_URL` / `DIRECT_URL`（Supabase）
   - `ADMIN_PASSWORD` / `ADMIN_SECRET`（`openssl rand -hex 32` で秘密鍵を作る）
   - `GOOGLE_FORM_URL`（問い合わせの Google フォーム）
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`（お知らせ・4コマ画像。Settings > API）
5. デプロイ後、`https://<service>.onrender.com/admin/login` で管理ログイン

`render.yaml` を置いてあるので、Blueprint から作ってもよい。値は Dashboard で入れる。

無料枠は約15分アクセスが無いとスリープする。気になる場合は UptimeRobot で数分おきにトップへ GET する。

## 3. 代替: Cloudflare（OpenNext）

静的の Pages プロジェクトに `next build` のまま置くと、Server Action と Prisma が動かない。

載せるなら公式は [OpenNext on Cloudflare Workers](https://opennext.js.org/cloudflare)。

- `@opennextjs/cloudflare` でビルドして `wrangler deploy`
- Prisma は Workers で接続を使い回さない。PostgreSQL は driver adapter か Hyperdrive
- `next.config.ts` に `serverExternalPackages: ["@prisma/client", ".prisma/client"]`

第1版は Render の方がセットアップが短い。帯域無制限やエッジを優先する段階で乗り換える。

## 使わないもの（第1版）

- Vercel Hobby（商用制限）
- Cloud Run（Dockerfile が要る。今は過剰）
- TiDB / Neon（Supabase を既に用意している）
- Upstash Redis（セッションを Redis にしていない）

## チェックリスト

- [ ] Supabase の Spending / 課金上限を確認した
- [ ] `DIRECT_URL` で migrate が通る
- [ ] 本番の `ADMIN_SECRET` を開発用から変えた
- [ ] 管理画面のパスワードを変えた
- [ ] SNS リンクとコピーを本番向けに直した
