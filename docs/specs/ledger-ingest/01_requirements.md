# 要件定義: 自動取込（冪等とトークン分離）

> 状態: as-built。第1スライスの CRUD は [machine-api](../machine-api/) が as-built。
> 対になる仕様: `runa-action-gateway` `docs/specs/budget-connector/`、`runa-stream-room` `docs/specs/budget-ledger/`。
> このサイトは数字の正本。誰が書くかの運用は Gateway。ここは **壊さない受け口** を足す。

## 概要

自動化された明細登録が、タイムアウト再送で同じ入金を二度書かないようにする。
部屋の HUD 用には読み取り専用トークンを出し、書き込みトークンは Gateway と管理画面だけが持つ。

金額の意味（無料枠の概算を載せるか否か）は Gateway が決める。この API は妥当な明細なら受け取る。

## 背景・目的

機械向け API 第1スライスはトークン1本で読み書きできた。LLM / cron のリトライ対策の `Idempotency-Key` は SHOULD のまま。
配信部屋と Gateway から自動登録するなら、二重登録が公開台帳を壊す。

## ユーザーストーリー

- Gateway として、同じ Super Chat id を二度 POST しても明細は 1 件であってほしい。
- 部屋として、GET だけできるトークンがほしい。なぜなら書き込み鍵を配信プロセスに置きたくないから。
- 運営として、管理画面からの手入力は今までどおり冪等キー無しでしたい。
- 視聴者として、現金と自給率が「払っていない LLM 概算」で減ってほしくない（運用は Gateway。API は事実だけ受ける）。

## 機能要件

### 必須（MUST）

- [x] `POST /api/v1/transactions` に任意フィールド `source`（max 40）と `sourceEventId`（max 120）を足す
- [x] `source` と `sourceEventId` が両方あるとき、その組はユニーク。再 POST は新しい行を作らず、既存を 200 で返す（作成時は 201）
- [x] 任意ヘッダー `Idempotency-Key`（max 200）。同じキーの再送は同じ取引を返す。キーはトークンごとに一意でよい
- [x] 手入力（管理画面 / フィールド無し）は今どおり新しい id。ユニーク制約の対象外
- [x] 読み取り専用トークン `RUNA_API_READ_TOKEN`（名称は実装時に env へ）。GET のみ。POST / PATCH / DELETE は 401 または 403
- [x] 既存 `RUNA_API_TOKEN` は読み書きのまま（後方互換）。Gateway 用の書き込みに使う
- [x] OpenAPI を同じ変更で更新する。破壊的変更は v2 にしない
- [x] 現金不足などの検査は今の管理画面と同じ（422 SOLVENCY）
- [x] `source` / `sourceEventId` を公開 HTML の明細表に大きく出さなくてよい。管理画面と API レスポンスには出してよい

### 任意（SHOULD / MAY）

- [ ] ideas / events / projects にも同じ冪等フィールド（transactions が先）
- [ ] `source` の列挙を meta に出す（`youtube` `note` `numerai` `openai_invoice` `render` `master` `gateway` `other` など）。未知文字列も max 内なら受けてよい
- [ ] 読み取りトークンで GET `/api/v1/status` 以外の list も許可する

## 非機能要件

- セキュリティ: トークンはログに出さない。比較は現行どおり timing-safe
- 互換: フィールドを省略した既存クライアントは動く
- パフォーマンス: `(source, sourceEventId)` にユニークインデックス
- 口調: API JSON は会計用語。公開 HTML の「僕 / 君」は変えない

## 受け入れ条件

- [x] 同じ `source` + `sourceEventId` の POST が 2 回でも Transaction は 1 行
- [x] 同じ `Idempotency-Key` の POST が 2 回でも 1 行。2 回目の本体は 1 回目と同じ
- [x] 読み取りトークンで POST できない
- [x] 書き込みトークンで今までどおり POST できる
- [x] フィールド無しの POST は今までどおり新しい行
- [x] `docs/api/openapi.yaml` が更新されている
- [x] 公開ページの集計式は変わらない

## スコープ外

- YouTube / カードからの直接同期（Gateway の仕事）
- 無料枠判定（Gateway の仕事）
- 部屋のホワイトボード Project との自動マージ
- 公開 JSON（読み取りもトークン必須のまま）
- 管理画面の廃止

## 決めたこと（2026-09-14・レビュー用）

1. 自動会計にするなら transactions の冪等が先。他リソースは後でよい
2. トークンは 2 本にする（読み取り専用 + 読み書き）。第1スライスの「1本」を上書きする
3. 部屋には読み取り専用だけ渡す。書き込みは Gateway と管理 Cookie
4. 金額が「事実か概算か」は API では見ない。見ない代わりに Gateway が概算を送らない
