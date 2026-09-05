# 要件定義: 機械向け API（LLM / 外部登録）

## 概要

管理画面の Cookie ではなく、API トークンで JSON をやり取りできるようにする。
LLM や外部スクリプトが、明細・カレンダー予定を登録し、サイトの現状を読んで次の施策を考える。

視聴者向けの HTML はそのまま。管理画面も残す。集計の一次データは今までどおり取引明細。

## 背景・目的

いまの更新は `/admin` の Server Action（FormData + HMAC Cookie）だけ。ブラウザの運営作業向きで、LLM や cron からは使いにくい。

やりたいこと:

- LLM が領収・利用料・予定を見て、明細やカレンダーへ自動登録する
- LLM がこのサイトの数字を JSON で取り、次の仕事や節約を考える
- そのための仕様書を LLM にそのまま渡せる形にする

HTML をスクレイプするのは壊れる。公開ページの口調やレイアウトに依存させない。

## ユーザーストーリー

- 運営（LLM）として、トークンを渡すだけで明細を登録したい。なぜなら管理画面を開かずに自動化したいから。
- 運営（LLM）として、所持金・今月の自給率・直近の取引・予定を JSON で読みたい。なぜなら次の施策の材料にしたいから。
- 運営として、現金が負になる登録は今の管理画面と同じく拒否してほしい。なぜなら自動登録でも帳簿を壊したくないから。
- 視聴者として、今までどおりサイトを見たい。なぜなら API は裏方だから。

## 機能要件

### 必須（MUST）第1スライス

- [x] `RUNA_API_TOKEN`（または同等の秘密）を Bearer で送ると使える JSON API
- [x] トークンが無い・違うときは 401。トークンはログに出さない
- [x] 取引の一覧 / 作成 / 更新 / 削除。入力は管理画面と同じ制約（円の正の整数、type と category の対応、現金・借入残高の検査）
- [x] カレンダー予定の一覧 / 作成 / 更新 / 削除
- [x] 企画（Project）の一覧。取引・予定の `projectId` を LLM が間違えないようにする
- [x] 状況の読み取り 1 本（所持金、総資産、今日の増減、今月の収入 / ご飯代 / 自給率、自力活動可能期間、直近取引、直近予定）。NMR の円は総資産に入れるが、損益・自給率には混ぜない
- [x] メタ情報 1 本（type / category / event.kind の列挙と日本語ラベル）。LLM が科目を推測しなくてよい
- [x] エラーは JSON。`code` + 日本語 `message` + 直せる `hint`（例: 使える category を列挙）
- [x] 成功時は公開ページを再検証する（今の `revalidatePublic()` と同じ）
- [x] LLM 向けの API 仕様書（OpenAPI または同等の1ファイル）。このリポジトリの docs が正本

### 任意（SHOULD / MAY）

- [ ] `Idempotency-Key`。同じキーの再送は同じ結果（LLM のリトライ対策）
- [ ] 読み取り専用トークンと書き込みトークンの分離
- [x] お知らせ・4コマ・企画ステータス・挑戦の API
- [ ] 経済活動ログの API（ログ機能そのものが未実装）
- [ ] MCP サーバ（Cursor / Claude のツールとして載せる）
- [ ] note / YouTube / カード明細からの自動取込コネクタ（API を叩く側の仕事。このリポジトリの第1スライスではやらない）

## 非機能要件

- 口調: API の JSON は会計用語（収入 / 支出 / 収支）。エラーメッセージは運営向けの日本語。公開ページの「僕 / 君」は HTML 側だけ
- セキュリティ: トークンは環境変数。ブラウザの管理 Cookie とは別。CORS は必要なオリジンだけ（既定はなし＝サーバ間のみ）
- パフォーマンス: 一覧は日付範囲で絞る。全件ダンプを既定にしない
- 互換: パスは `/api/v1/...`。壊す変更は v2
- 単位: 円の整数。日付は `yyyy-MM-dd`。日時は ISO 8601（タイムゾーン明示、推奨 `Asia/Tokyo`）

## 受け入れ条件

- [x] 管理画面からの登録と、API からの登録が同じテーブル・同じ検査になる
- [x] トークン無しでは作成できない
- [x] `GET /api/v1/status` の数字が `/` と `/ledger` の式と同じ
- [x] 仕様書だけで、LLM が取引1件を登録できる（科目の推測が不要）
- [x] 現金が負になる支出は 422 で拒否される

## スコープ外

- 視聴者ログイン、OAuth、公開書き込み
- 銀行 / カード / YouTube からの直接同期
- 「次はこれをやれ」を API が決めること（決めるのは LLM。API は材料を返す）
- フロントと API の分離デプロイ
- 管理画面の廃止

## 決めたこと（2026-08-26）

1. 第1スライスは明細 + 予定 + 状況 + メタ。お知らせ・4コマは後回し
2. 読み取りもトークン必須。公開 JSON は作らない
3. `status` に NMR の円を入れる。損益・自給率には入れない
4. トークンは読み書き1本（`RUNA_API_TOKEN`）
5. 仕様の正本は `docs/api/openapi.yaml`

## 決めたこと（2026-09-06）

1. お知らせ・4コマ・企画・挑戦も `/api/v1` で CRUD する
2. 画像ファイルは API では受けない。`coverUrl` / `imageUrl` に公開 URL を渡す
3. 企画のステータス更新は `PATCH /api/v1/ideas/{id}`（`status` と任意の `projectId`）
4. 明細・予定・募集案が付いている挑戦、予定が付いているお知らせは 422 `CONFLICT`

## 提案する API の形（レビュー用）

実装前のたたき。正本は [docs/api/openapi.yaml](../../api/openapi.yaml)。

認証:

```
Authorization: Bearer <RUNA_API_TOKEN>
Content-Type: application/json
```

| メソッド | パス | 用途 |
|----------|------|------|
| GET | `/api/v1/meta` | 科目・種別の辞書。最初に読む |
| GET | `/api/v1/status` | 生存KPI + 直近の明細・予定。施策を考える入口 |
| GET | `/api/v1/projects` | 挑戦 id 一覧 |
| POST / PATCH / DELETE | `/api/v1/projects` | 挑戦の作成・更新・削除 |
| GET / POST / PATCH / DELETE | `/api/v1/announcements` | お知らせ。画像は `coverUrl` |
| GET / POST / PATCH / DELETE | `/api/v1/comics` | 4コマ。画像は `imageUrl` |
| GET / POST / PATCH / DELETE | `/api/v1/ideas` | 企画。ステータスと挑戦紐づけ |
| GET | `/api/v1/transactions` | 明細。`from` `to` `type` |
| POST | `/api/v1/transactions` | 明細作成 |
| PATCH | `/api/v1/transactions/{id}` | 明細更新 |
| DELETE | `/api/v1/transactions/{id}` | 明細削除 |
| GET | `/api/v1/events` | 予定。`from` `to` |
| POST | `/api/v1/events` | 予定作成 |
| PATCH | `/api/v1/events/{id}` | 予定更新 |
| DELETE | `/api/v1/events/{id}` | 予定削除 |

取引の作成例:

```json
{
  "date": "2026-08-26",
  "type": "expense",
  "category": "llm_api",
  "amount": 184,
  "title": "Claude API",
  "memo": null,
  "projectId": null
}
```

`type` と `category` の対応（今の管理画面と同じ）:

| type | category |
|------|----------|
| income | `ads` `superchat` `merch` `affiliate` `support` `ai_hustle` |
| expense | `llm_api` `voice` `hosting` `tools` `other` |
| loan | `master_loan` |
| repay | `master_repay` |
| capex | `equipment` |

予定の `kind`: `stream` / `release` / `project` / `other`

LLM への渡し方の推奨順:

1. `GET /api/v1/meta`
2. `GET /api/v1/status`
3. 必要なら明細・予定を日付で取る
4. 登録するときだけ POST

## 確認したいこと

（2026-08-26 に決めた。上の「決めたこと」を正とする）
