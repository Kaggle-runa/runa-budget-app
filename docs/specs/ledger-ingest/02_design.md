# 設計: 自動取込（冪等とトークン分離）

> 01_requirements.md。CRUD の置き場は [machine-api/02_design.md](../machine-api/02_design.md)。

## データモデル

`Transaction` に追加（Prisma 正本を実装時に `docs/architecture/data-model.md` も更新）:

| カラム | 型 | 制約 |
|--------|----|------|
| `source` | String? | max 40 |
| `sourceEventId` | String? | max 120 |
| ユニーク | `(source, sourceEventId)` | 両方 non-null の行だけ。PostgreSQL は partial unique index |

`Idempotency-Key` 用の表（新規でよい）:

| カラム | 意味 |
|--------|------|
| `key` | ヘッダー値（トークン識別子と組み合わせて一意） |
| `transactionId` | 作った明細 |
| `createdAt` | |

キーの寿命は会計なので消さない（再送が何日後でも同じ行）。

ideas / events には第1弾では足さない。

## 認証

`lib/api/auth.ts` を拡張:

| トークン | 許可 |
|----------|------|
| `RUNA_API_READ_TOKEN` | GET |
| `RUNA_API_TOKEN` | GET + POST + PATCH + DELETE（現行） |
| どちらも無い・不一致 | 今どおり 401。両方未設定は 503 |

未設定の読み取りトークンは「読み取り専用を使わない」だけ。書き込みトークンが無いときの 503 は現行。

## 更新経路

`POST /api/v1/transactions`:

1. 認証
2. `Idempotency-Key` があれば表を見る。ヒットしたら 200 + 既存
3. `source` + `sourceEventId` があれば unique を見る。ヒットしたら 200 + 既存
4. 現行の `lib/transactions.ts` で作成（現金検査）
5. 冪等表と source を保存
6. `revalidatePublic()`
7. 新規は 201

競合（同時二重 POST）は unique 違反を捕まえて既存を 200 で返す。

## OpenAPI

`docs/api/openapi.yaml` の `TransactionWrite` に `source` / `sourceEventId`。
components に `Idempotency-Key` ヘッダー。
info.description に「自動登録は Gateway。部屋は GET 専用トークン」を追記。

## エラー

既存コードに加え:

| ケース | コード | HTTP |
|--------|--------|------|
| 読み取りトークンで POST | `UNAUTHORIZED` | 401 |
| 同じキーで本文が違う | `CONFLICT` | 422（1回目の本文を正とする。上書きしない） |

## 公開画面

`/ledger` の一覧は今の列のまま。source は出さなくてよい。
