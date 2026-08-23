# 設計: 4コマ漫画

## 画面構成

| パス | 画面 | 概要 |
|------|------|------|
| `/` | 紹介 | 公開中の作品をサムネ一覧。クリックで1枚の4コマをモーダル表示 |
| `/admin/yonkoma` | 管理 | 作成 / 編集 / 削除。非公開可 |

## 更新経路

| 関数 | 概要 | 入力 |
|------|------|------|
| `upsertComicStripAction` | 作成/更新。ファイルがあれば Storage `announcements/yonkoma/` へ | title, sortOrder, published, 1枚の file または URL |
| `deleteComicStripAction` | 削除 | id |

## データモデル

`ComicStrip`: title, imageUrl, published, sortOrder

## コンポーネント構成

```
components/comics/yonkoma-gallery.tsx
components/motion/yon-koma.tsx
components/admin/comic-form.tsx
```
