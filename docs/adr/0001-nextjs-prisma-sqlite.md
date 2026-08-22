# ADR 0001: Next.js + Prisma + SQLite と管理者 Cookie 認証

## ステータス

採用済み

## コンテキスト

チャンネルの顔となる公開サイトと、運営が収支・予定を入れる管理画面が必要。
参照した llm-game は Next.js + Tailwind + shadcn、まる見え政治資金（marumie）は Next.js + Prisma。
第1版はローカルですぐ動かせることが優先。

## 決定

- **FW**: Next.js 15 App Router。公開と管理を同一アプリに置く
- **DB**: Prisma + SQLite。本番や複数人編集が必要になったら Postgres へ
- **認証**: `ADMIN_PASSWORD` + HMAC 署名 Cookie。視聴者ログインは作らない
- **更新**: Server Action + `revalidatePath`。WebSocket は後回し

## 理由

- デザイン参照（llm-game）と同じスタックで見た目を揃えやすい
- 公開台帳の規模なら SQLite で足りる
- 管理者は運営1人想定なのでパスワード1つで足りる

## 影響・今後

- 銀行連携やリアルタイム購読が必要になったら ADR を追加する
- Cookie 秘密鍵は本番で必ず差し替える
