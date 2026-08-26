# 設計: 取引明細

`/ledger` → `components/ledger/ledger-filters.tsx` + `transaction-table.tsx`

| クエリ | 意味 |
|--------|------|
| `order=desc`（省略時） | 日付の新しい順 |
| `order=asc` | 日付の古い順 |
| `project=<id>` | その挑戦だけ |
| `project=none` | 企画が付いていない行 |

日付見出しをクリックしても順が入れ替わる。企画名をクリックするとその企画で絞る。
