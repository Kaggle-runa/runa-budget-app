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
| 12 | 生存実験の実況 | `/` | [survival-experiment](../specs/survival-experiment/) | as-built |
| 13 | Numerai モデル | `/numerai` | [live-status](../specs/live-status/) | 一部 |

## 各機能の要点

### 1. チャンネルトップ

実験の問い、ご飯代の説明、生存KPI、いまのルナの状況、現在の挑戦、マスター説明、立ち絵、お知らせ3件、4コマ、SNS。

### 2. 収支ダッシュボード

いまのルナの状況、今月の運営カウンター、貸借対照表、資金の流れ（サンキー）、月次の上下棒、科目ドーナツ。
損益（収入 / 支出）と資金（借入 / 返済 / 機材）は混ぜない。「いまのルナの状況」はお仕事と NMR を分け、「今日の資産増減」は仕事の収支 + NMR 評価額の前日比。帳簿の損益には NMR を入れない。

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

### 12. 生存実験の実況

中心の問いは「僕は、自分で自分を養えるかな？」。所持金、今日の増減、今月の自給率、自力活動可能期間、進行中企画の損益をトップに出す。ご飯代は `llm_api` / `voice` / `hosting`。

### 13. Numerai モデル

`runa_version1` と `runa_version2` の公開成績。`/numerai` は説明ページではなく観察ページ（ヒーローの Stake 円 → モデル → ひとこと → 短い説明）。損益・自給率には入れない。

## 第1版でやらないこと

- 企画投票、マスター介入時間・自動化率、総資産への NMR 円換算、経済活動ログ、株 / FX
- 視聴者資金の運用や売買指示の投票
- 「AIで儲ける方法」コンテンツ
- 銀行 / カード / YouTube API 連携
- WebSocket
- 多言語
- フロントと API の分離デプロイ
