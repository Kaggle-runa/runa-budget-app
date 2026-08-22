# 公開パスと Server Action

第1版は REST API をほぼ持たず、Server Action で更新する。

## 公開ページ

| パス | 概要 |
|------|------|
| `/` | チャンネル紹介 |
| `/dashboard` | 収支ダッシュボード |
| `/calendar` | カレンダー |
| `/ledger` | 取引明細 |
| `/ideas` | 企画一覧・投稿 |
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
| `/admin/ideas` | 企画ステータス更新 | 必要 |
| `/admin/announcements` | お知らせ CRUD | 必要 |

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
| `updateIdeaStatusAction` | `lib/actions/ideas.ts` | admin | ステータス更新（FormData） |
| `deleteIdeaAction` | `lib/actions/ideas.ts` | admin | 企画削除 |

入力は zod で検証する。成功時は `revalidatePublic()` で公開ページを再検証する。
