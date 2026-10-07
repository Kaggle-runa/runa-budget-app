# 設計: 競走の結果

要件は [01_requirements.md](01_requirements.md)。

## 画面

| パス | 役割 |
|------|------|
| `/races` | 現金残高、月の収支と回収率、券種別の回収率、日次、買い目一覧（20件ずつ） |
| `/admin/races` | 競艇 CSV のアップロード |

ナビの公開ラベルは「レース」。管理ラベルも「レース」。

`/races` の残高は `balanceSheet` の現金。期間の数字は買い目から計算し、現金とは別だと一文で書く。

## データ

`RaceTicket` が買い目。日付は `yyyy-MM-dd` の文字列。場名と組番は保存前に空白を除く。

同一性: `sport + date + receiptNumber + venue + race + betType + selection`

`source + sourceEventId` もユニーク（両方あるとき）。`RaceIdempotency` は API の `Idempotency-Key` 用。

## 明細への接続

`source = "race"`、`sourceEventId = "{sport}:{date}:{受付番号}:{勝式}:{組番}"`。

収支がプラスなら収入 `ai_hustle`（事業収入）、マイナスなら支出 `other`（その他）。金額は払戻金 − 購入金額の絶対値。摘要は「競艇 鳴門2R 拡連複 1=3」。収支 0 の買い目は行にしない。日付は日本時間のその日として保存する。

再取込で同じ `sourceEventId` は更新する。その日の買い目から外れた行と、以前の「競艇の購入」「競艇の払戻」は消す。

保存は1トランザクション。買い目の upsert のあと、影響する日だけ明細を投影し、現金が負ならロールバックする。

自給率の収入には、プラスの収支（事業収入）だけ入る。マイナスの収支はその他なのでご飯代に入れない。現金の式は変えない。

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
