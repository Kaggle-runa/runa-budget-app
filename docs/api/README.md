# 公開パスと Server Action

第1版は REST API をほぼ持たず、Server Action で更新する。

## 公開ページ

| パス | 概要 |
|------|------|
| `/` | 生存実験の実況（問い・総資産・いまのルナの状況・現在の挑戦） |
| `/dashboard` | 収支ダッシュボード（いまのルナの状況 + 会計） |
| `/calendar` | カレンダー |
| `/ledger` | 取引明細（日付順・企画で絞れる） |
| `/numerai` | ルナの Numerai モデル観察（Stake 円、成績、ひとこと、短い説明） |
| `/ideas` | 企画一覧・投稿。完了は `#past` |
| `/ideas/[id]` | 採用・実施中・完了の企画詳細 |
| `/ideas/p/[projectId]` | 募集案が無い挑戦の詳細 |
| `/news` | お知らせ一覧 |
| `/news/[id]` | お知らせ本文 |
| `/contact` | 問い合わせ（Googleフォームへ誘導） |

## 管理ページ

| パス | 概要 | 認証 |
|------|------|------|
| `/admin/login` | ログイン | 不要 |
| `/admin` | `/admin/transactions` へリダイレクト | 必要 |
| `/admin/transactions` | 取引 CRUD | 必要 |
| `/admin/events` | 予定 CRUD | 必要 |
| `/admin/projects` | 挑戦 CRUD と収益モニタ | 必要 |
| `/admin/ideas` | 企画ステータス更新 | 必要 |
| `/admin/announcements` | お知らせ CRUD | 必要 |
| `/admin/yonkoma` | 4コマ CRUD | 必要 |
| `/admin/numerai` | Numerai / NMR円の手動取得 | 必要 |

## Server Action

| 関数 | ファイル | 認可 | 概要 |
|------|----------|------|------|
| `loginAction` | `lib/actions/auth.ts` | なし | パスワード照合して Cookie 発行 |
| `logoutAction` | `lib/actions/auth.ts` | なし | Cookie 削除 |
| `upsertTransactionAction` | `lib/actions/transactions.ts` | admin | 取引作成/更新 |
| `deleteTransactionAction` | `lib/actions/transactions.ts` | admin | 取引削除 |
| `upsertEventAction` | `lib/actions/events.ts` | admin | 予定作成/更新 |
| `deleteEventAction` | `lib/actions/events.ts` | admin | 予定削除 |
| `submitIdeaAction` | `lib/actions/ideas.ts` | 公開 | 企画投稿（honeypot + IP レート制限） |
| `upsertAnnouncementAction` | `lib/actions/announcements.ts` | admin | お知らせ作成/更新。画像ファイルは Storage へ |
| `deleteAnnouncementAction` | `lib/actions/announcements.ts` | admin | お知らせ削除 |
| `upsertComicStripAction` | `lib/actions/comics.ts` | admin | 4コマ作成/更新。4コマ1枚の画像を Storage `yonkoma/` へ |
| `deleteComicStripAction` | `lib/actions/comics.ts` | admin | 4コマ削除 |
| `upsertProjectAction` | `lib/actions/projects.ts` | admin | 挑戦作成/更新 |
| `deleteProjectAction` | `lib/actions/projects.ts` | admin | 挑戦削除 |
| `refreshNumeraiAction` | `lib/actions/numerai.ts` | admin | Numeraiキャッシュ破棄と再取得 |
| `updateIdeaStatusAction` | `lib/actions/ideas.ts` | admin | ステータス更新（FormData） |
| `deleteIdeaAction` | `lib/actions/ideas.ts` | admin | 企画削除 |

入力は zod で検証する。成功時は `revalidatePublic()` で公開ページを再検証する。

## 機械向け API（`/api/v1`）

正本は [openapi.yaml](./openapi.yaml)。Bearer `RUNA_API_TOKEN`。公開 JSON は無い。

| パス | 概要 |
|------|------|
| `GET /api/v1/meta` | 科目・種別の辞書 |
| `GET /api/v1/status` | 生存KPI + 総資産（現金+機材+NMR円）+ NMR円（損益には入れない）+ 直近明細・予定 |
| `GET /api/v1/projects` | 企画一覧 |
| `/api/v1/transactions` | 明細の一覧 / 作成 / 更新 / 削除 |
| `/api/v1/events` | 予定の一覧 / 作成 / 更新 / 削除 |

