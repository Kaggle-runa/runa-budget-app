# 機能一覧

実装・改修のときは、この一覧から該当機能の仕様書を開いて進める。
テーブルは [data-model.md](../architecture/data-model.md)。画面と Action は [api/README.md](../api/README.md)。

| # | 機能 | パス | 仕様 | 状態 |
|---|------|------|------|------|
| 1 | チャンネルトップ | `/` | [channel-home](../specs/channel-home/) | as-built |
| 2 | 収支ダッシュボード | `/dashboard` | [dashboard](../specs/dashboard/) / [balance-sheet](../specs/balance-sheet/) | as-built |
| 3 | カレンダー | `/calendar` | [calendar](../specs/calendar/) | as-built |
| 4 | 取引明細 | `/ledger` | [ledger](../specs/ledger/) | as-built |
| 5 | 企画募集 | `/ideas` | [idea-submissions](../specs/idea-submissions/) | as-built |
| 6 | お知らせ | `/news`, `/news/[id]` | [announcements](../specs/announcements/) | as-built |
| 7 | 問い合わせ | `/contact` または外部フォーム | [contact](../specs/contact/) | as-built |
| 8 | 管理画面 | `/admin/*` | [admin](../specs/admin/) | as-built |
| 9 | 動き・世界観 | 全体 | [motion](../specs/motion/) | as-built |
| 10 | デプロイ | Render + Supabase | [deploy](../specs/deploy/) / [architecture/deploy.md](../architecture/deploy.md) | as-built |
| 11 | 4コマ漫画 | `/`, `/admin/yonkoma` | [yonkoma](../specs/yonkoma/) | as-built |

## 各機能の要点

### 1. チャンネルトップ

紹介、口調、文字ロゴ、丸ロゴ、月の窓の立ち絵（普通 / 喜び / 困り）、4コマ、SNS、現金残高のチラ見せ、最新お知らせ3件。

### 2. 収支ダッシュボード

今月の運営カウンター、貸借対照表、資金の流れ（サンキー）、月次の上下棒、科目ドーナツ。
損益（収入 / 支出）と資金（借入 / 返済 / 機材）は混ぜない。

恒等式: `現金 + 機材 = マスター借入 + 累計収支`

### 3. カレンダー

日次損益と予定バッジ。日付を選ぶとその日の取引と予定。

### 4. 取引明細

公開台帳。集計の一次データ。単位は円。時点は yyyy-MM-dd。

### 5. 企画募集

視聴者が投稿する。honeypot と IP レート制限あり。運営がステータスを変える。

### 6. お知らせ

カード一覧と本文。カバー画像は管理画面からアップロードするか URL を入れる。カテゴリは `news` / `stream` / `other`。

### 7. 問い合わせ

`GOOGLE_FORM_URL` があれば外部フォームへ。無ければ `/contact` で準備中。

### 8. 管理画面

パスワード + HMAC Cookie。取引・予定・企画・お知らせ・4コマの CRUD。

### 9. 動き・世界観

CSS のみ。開幕カーテン、イージング、`prefers-reduced-motion` を切らない。

### 10. デプロイ

Next.js 1本を Render に載せる。DB は Supabase Postgres。

### 11. 4コマ漫画

紹介ページにサムネ一覧。クリックで4コマ1枚をモーダル表示。管理画面から追加・編集・非公開にできる。

## 第1版でやらないこと

- APIランウェイ、ファン投票、週報
- 銀行 / カード / YouTube API 連携
- WebSocket
- 多言語
- フロントと API の分離デプロイ
- Supabase Auth / Storage（DB だけ使う）
