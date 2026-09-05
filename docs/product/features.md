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
| 15 | 挑戦の実況 | `/` ・ `/admin/projects` | [project-challenges](../specs/project-challenges/) | as-built |
| 6 | お知らせ | `/news`, `/news/[id]` | [announcements](../specs/announcements/) | as-built |
| 7 | 問い合わせ | `/contact` または外部フォーム | [contact](../specs/contact/) | as-built |
| 8 | 管理画面 | `/admin/*` | [admin](../specs/admin/) | as-built |
| 9 | 動き・世界観 | 全体 | [motion](../specs/motion/) | as-built |
| 10 | デプロイ | Render + Supabase | [deploy](../specs/deploy/) / [architecture/deploy.md](../architecture/deploy.md) | as-built |
| 11 | 4コマ漫画 | `/`, `/admin/yonkoma` | [yonkoma](../specs/yonkoma/) | as-built |
| 12 | 生存実験の実況 | `/` | [survival-experiment](../specs/survival-experiment/) | as-built |
| 13 | Numerai モデル | `/numerai` | [live-status](../specs/live-status/) | 一部 |
| 14 | 機械向け API | `/api/v1` | [machine-api](../specs/machine-api/) | as-built |

## 各機能の要点

### 1. チャンネルトップ

実験の問い、ご飯代の説明、総資産（現金 / NMR / 機材）、今月の生存ラベル、いまのルナの状況、現在の挑戦、Numerai入口、マスター説明、立ち絵、お知らせ3件、4コマ、SNS。

### 2. 収支ダッシュボード

いまのルナの状況、今月の運営カウンター、貸借対照表（NMRは時価と評価差額）、資金の流れ（サンキー）、月次の上下棒、科目ドーナツ。収支の流れと内訳は期間を選べる。
損益（収入 / 支出）と資金（借入 / 返済 / 機材）は混ぜない。「いまのルナの状況」はお仕事と NMR を分け、「今日の資産増減」は仕事の収支 + NMR 円の前日比（価格と枚数）。NMRカードに Stake 前日比（枚数）も出す。帳簿の損益には NMR を入れない。

恒等式（帳簿）: `現金 + 機材 = マスター借入 + 累計収支`
表示の B/S: `現金 + 機材 + NMR = マスター借入 + 累計収支 + NMR評価差額`

### 3. カレンダー

日次損益と予定バッジ。日付を選ぶとその日の取引と予定。

### 4. 取引明細

公開台帳。集計の一次データ。単位は円。時点は yyyy-MM-dd。日付の新しい順 / 古い順と、企画での絞り込みができる。

### 5. 企画募集

視聴者が投稿する。honeypot と IP レート制限あり。運営がステータスを変える。採用・実施中・完了は詳細ページ（結果と金額・明細の下に、企画の概要と note / YouTube の別カード）。採用した案は挑戦（Project）にしてトップで実況する。完了は企画ページの結果欄。

### 6. お知らせ

カード一覧と本文。カバー画像は管理画面からアップロードするか URL を入れる。カテゴリは `news` / `stream` / `other`。

### 7. 問い合わせ

`GOOGLE_FORM_URL` があれば外部フォームへ。無ければ `/contact` で準備中。

### 8. 管理画面

パスワード + HMAC Cookie。取引・予定・企画・お知らせ・4コマの CRUD。Numerai の数字は管理画面から手動で取り直せる。

### 9. 動き・世界観

CSS のみ。開幕カーテン、イージング、`prefers-reduced-motion` を切らない。

### 10. デプロイ

Next.js 1本を Render に載せる。DB は Supabase Postgres。

### 11. 4コマ漫画

紹介ページにサムネ一覧。クリックで4コマ1枚をモーダル表示。管理画面から追加・編集・非公開にできる。

### 12. 生存実験の実況

中心の問いは「僕は、自分で自分を養えるかな？」。トップの主役は総資産（現金 + 機材 + NMR円）。今月の自給率ラベル、連続生存、自力活動可能期間、進行中企画の収益 / トークン代 / 稼いだ金額を出す。ご飯代は `llm_api` / `voice` / `hosting`。損益・自給率には NMR を入れない。

### 13. Numerai モデル

`runa_version1` と `runa_version2` の公開成績。`/numerai` は説明ページではなく観察ページ（総NMR / Stake中 → いまの大会 → モデル → ひとこと → 短い説明）。Stake は `stakeValue`。Payout/Burn は確定後に枚数へ入れる。支払い対象と評価期間は `roundScoreConfigs`。旧ウォレットと Stake は分けて出す。損益・自給率には入れない。

### 14. 機械向け API

LLM / 外部スクリプトが明細・予定・お知らせ・4コマ・企画・挑戦を JSON で登録し、現状を読む。正本は [openapi.yaml](../api/openapi.yaml)。Bearer `RUNA_API_TOKEN`。管理画面は残す。公開 JSON は無い。NMR の円は総資産に入れるが損益には入れない。画像ファイルのアップロードは管理画面。API は公開 URL を渡す。

### 15. 挑戦の実況

管理画面で挑戦を登録する。進行中はトップの「現在の挑戦」。完了は企画ページの「これまでの結果」。明細の企画欄で紐づけると、収益・トークン代・稼いだ金額が出る。仕組みの説明は note / YouTube などの外部リンク（YouTubeは埋め込み）。マスターの介入は挑戦に1メモ。

## 第1版でやらないこと

- 企画投票、マスター介入時間・自動化率、経済活動ログ、株 / FX
- 視聴者資金の運用や売買指示の投票
- 「AIで儲ける方法」コンテンツ
- 銀行 / カード / YouTube API 連携
- WebSocket
- 多言語
- フロントと API の分離デプロイ
