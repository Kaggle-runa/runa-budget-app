# 設計: 挑戦の実況

## 画面構成

| パス | 画面 | 概要 |
|------|------|------|
| `/` | 現在の挑戦（進行中のみ。複数可） | `SurvivalChallengeCard` |
| `/ideas` `#past` | これまでの結果 | 完了した企画・挑戦 |
| `/ideas/[id]` | 企画の詳細 | 上: 結果と金額・明細。下: 概要と note / YouTube |
| `/ideas/p/[projectId]` | 挑戦だけの詳細 | 募集案が無い完了挑戦 |
| `/admin/projects` | 挑戦 CRUD + 収益モニタ | 管理 |

数字の一次データは取引明細の `projectId`。

## 更新経路

| 関数 | 概要 | 入力 |
|------|------|------|
| `upsertProjectAction` | 作成/更新 | title, status, overview, masterNote, links |
| `deleteProjectAction` | 削除。明細・予定・募集案があると拒否 | id |

成功時は `revalidatePublic()`。

## 集計

`lib/survival.ts` の `summarizeChallenges`。

- 収益: 紐づく `income`
- トークン代: 紐づく `expense` のうち `llm_api` / `voice`
- 稼いだ金額: 収益 − トークン代
- その他経費: 残りの支出
- 最終収支: 収入 − 全支出（既存の `pl`）

## コンポーネント

```
components/admin/project-form.tsx
components/survival/challenge-card.tsx
components/survival/challenge-links.tsx
```
