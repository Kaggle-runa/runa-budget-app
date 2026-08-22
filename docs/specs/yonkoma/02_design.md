# 設計: 4コマ漫画

## 画面構成

| パス | 画面 | 概要 |
|------|------|------|
| `/` | 紹介 | 公開中の作品を sortOrder → 新しい順で並べる |
| `/admin/yonkoma` | 管理 | 作成 / 編集 / 削除。非公開可 |

## 更新経路

| 関数 | 概要 | 入力 |
|------|------|------|
| `upsertComicStripAction` | 作成/更新。ファイルがあれば Storage `announcements/yonkoma/` へ | title, sortOrder, published, 4枚の file または URL |
| `deleteComicStripAction` | 削除 | id |

## データモデル

`ComicStrip`: title, panel1–4Url, published, sortOrder

## コンポーネント構成

```
components/motion/yon-koma.tsx
components/admin/comic-form.tsx
```
