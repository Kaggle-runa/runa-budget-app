# ADR 0002: Supabase Postgres と安価なアプリホスティング

## ステータス

採用済み

## コンテキスト

第1版は Prisma + SQLite でローカル完結だった。本番は無料〜低コストで公開したい。
運営は Supabase を用意済み。参照記事は SPA + API 分離を前提に Cloudflare Pages を推している。

このアプリは Next.js App Router のフルスタック（Server Component / Server Action / Cookie 認証）であり、静的フロントと API に分かれていない。

## 決定

- **DB**: Supabase（PostgreSQL）。Prisma の provider を `postgresql` にする
- **接続**: アプリは Transaction pooler（`DATABASE_URL`、6543 + `pgbouncer=true`）、migrate は Direct（`DIRECT_URL`、5432）
- **アプリ本体**: 1プロセスのままデプロイする。フロントだけ Cloudflare Pages（静的）には載せない
- **推奨ホスティング（無料優先）**: Render の Web Service（無料枠）。GitHub 接続が簡単
- **Cloudflare に載せる場合**: 従来の Pages 静的ホストではなく、OpenNext（`@opennextjs/cloudflare`）で Workers に載せる。Prisma は driver adapter が必要になり、第1版では必須にしない

Redis / Cloud Run / TiDB は第1版では使わない。

## 理由

- 記事自身が「Rails / Next.js / Laravel は Render や Railway にまとめた方がシンプル」と書いている
- Supabase は無料枠（認証・Postgres）があり、すでに用意されている
- フロント/API 分離は今のコードを大きく書き直すことになる
- Vercel Hobby は商用利用に制限がある。チャンネルの顔として収益化する場合は避ける

## 影響・今後

- ローカルも Postgres（同じ Supabase プロジェクトでよい）
- アクセスが少なく Render がスリープしても、個人チャンネルの第1版では許容する
- トラフィックが増えたら OpenNext + Cloudflare、または Render 有料へ
