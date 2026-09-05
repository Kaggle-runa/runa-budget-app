# 設計: 機械向け API

## 画面構成

HTML 画面は増えない。JSON のみ。

| パス | 概要 |
|------|------|
| `/api/v1/meta` | 科目・種別の辞書 |
| `/api/v1/status` | 生存KPI + NMR円 + 直近明細・予定 |
| `/api/v1/projects` | 挑戦の一覧・作成 |
| `/api/v1/projects/[id]` | 挑戦の取得・更新・削除 |
| `/api/v1/announcements` | お知らせの一覧・作成 |
| `/api/v1/announcements/[id]` | お知らせの取得・更新・削除 |
| `/api/v1/comics` | 4コマの一覧・作成 |
| `/api/v1/comics/[id]` | 4コマの取得・更新・削除 |
| `/api/v1/ideas` | 企画の一覧・作成 |
| `/api/v1/ideas/[id]` | 企画の取得・更新・削除 |
| `/api/v1/transactions` | 明細の一覧・作成 |
| `/api/v1/transactions/[id]` | 明細の取得・更新・削除 |
| `/api/v1/events` | 予定の一覧・作成 |
| `/api/v1/events/[id]` | 予定の取得・更新・削除 |

正本: [docs/api/openapi.yaml](../../api/openapi.yaml)

## 認証

`Authorization: Bearer <RUNA_API_TOKEN>`。管理画面の Cookie とは別。
未設定は 503、無い・違うトークンは 401。比較は SHA-256 してから `timingSafeEqual`。

## 更新経路

書き込みは `lib/transactions.ts` / `lib/events.ts` / `lib/announcements.ts` / `lib/comics.ts` / `lib/ideas.ts` / `lib/projects.ts`。管理画面の Server Action もここを使う。
現金・借入残高の検査は今の管理画面と同じ。成功時は `revalidatePublic()`。
画像ファイルのアップロードは管理画面だけ。API は公開 URL を渡す。

## データモデル

新しいテーブルは `NmrDailySnapshot`（NMR 前日比用）。明細・予定は既存。

## コンポーネント構成

```
app/api/v1/
lib/api/auth.ts
lib/api/http.ts
lib/transactions.ts
lib/events.ts
lib/announcements.ts
lib/comics.ts
lib/ideas.ts
lib/projects.ts
```

ページから Prisma は叩かない。API ルートは `lib/` 経由。

## エラー

| ケース | コード | HTTP |
|--------|--------|------|
| トークン未設定 | `TOKEN_UNSET` | 503 |
| 認証失敗 | `UNAUTHORIZED` | 401 |
| 入力不正 | `VALIDATION` | 400 |
| 現金不足など | `SOLVENCY` | 422 |
| 紐づきがあって消せない | `CONFLICT` | 422 |
| 無い id | `NOT_FOUND` | 404 |
| その他 | `INTERNAL` | 500 |

形: `{ "error": { "code", "message", "hint" } }`

## NMR

`status.nmr` に円換算と前日比。円の前日比は日次スナップショットの円の差（価格＋枚数）。`stakeDelta` は Stake 枚数の差。昨日が無いときは円は価格の24h変化、Stakeは null。`includedInProfit` は常に false。自給率の式は変えない。
`status.assets` は `現金 + 機材 + NMR円`。損益には入れない。
