# 設計: 競走の結果

要件は [01_requirements.md](01_requirements.md)。

## 画面

| パス | 役割 |
|------|------|
| `/races` | 現金残高、期間の収支と回収率、日次、買い目一覧。種目と日付で絞る |
| `/admin/races` | 競艇 CSV のアップロード |

ナビの公開ラベルは「レース」。管理ラベルも「レース」。

`/races` の残高は `balanceSheet` の現金。期間の数字は買い目から計算し、現金とは別だと一文で書く。

## データ

`RaceTicket` が買い目。日付は `yyyy-MM-dd` の文字列。場名と組番は保存前に空白を除く。

同一性: `sport + date + receiptNumber + venue + race + betType + selection`

`source + sourceEventId` もユニーク（両方あるとき）。`RaceIdempotency` は API の `Idempotency-Key` 用。

## 明細への接続

`source = "race"`、`sourceEventId = "{sport}:{date}:stake"` または `"{sport}:{date}:payout"`。

| 行 | type | category | 摘要 | 金額 |
|----|------|----------|------|------|
| 購入 | expense | `race_stake` | 競艇の購入 / 競馬の購入 | その日の購入合計 |
| 払戻 | income | `race_payout` | 競艇の払戻 / 競馬の払戻 | その日の払戻合計 |

払戻が 0 の日は収入行を作らない。再取込で 0 になったら消す。
金額が変わったら同じ id を更新する。

保存は1トランザクション。買い目の upsert のあと、影響する日だけ明細を投影し、現金が負ならロールバックする。

自給率の収入（`summarizeSurvival` の `monthIncome`）には `race_payout` を含める。購入はご飯代に入れない。現金の式は変えない。

## 取込

- 管理画面: CSV。CP932 と UTF-8。ヘッダ不一致、または的中返還が「的中」「なし」以外が1行でもあれば全体を入れない
- `POST /api/v1/race-tickets`: 買い目1件。競艇も競馬も同じ形。書き込みトークン
- `GET /api/v1/race-tickets`: 一覧と集計。読み取りトークンも可

競馬の CSV パーサは作らない。

## 置き場

```
lib/races/          解析、集計、明細投影、取込
components/races/   公開ページ
components/admin/   CSVフォーム
app/races/page.tsx
app/admin/races/page.tsx
app/api/v1/race-tickets/route.ts
```
