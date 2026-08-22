# 設計: （機能名）

> 01_requirements.md の要件を満たす技術設計。`.cursor/rules/` に沿って書く。

## 画面構成

| パス | 画面 | 概要 |
|------|------|------|
| /example | 一覧 | （説明） |

## 更新経路

| 関数 | 概要 | 入力 |
|------|------|------|
| exampleAction | （説明） | `{ name: string }` |

## データモデル

（追加・変更するエンティティ。`docs/architecture/data-model.md` にも反映）

## コンポーネント構成

```
components/
└── example/
    ├── example-list.tsx
    └── example-form.tsx
```

## エラーハンドリング

| ケース | 挙動 |
|--------|------|
| バリデーションエラー | フォーム下に日本語メッセージ |
