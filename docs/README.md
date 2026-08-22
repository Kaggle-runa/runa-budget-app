# docs/ — 仕様駆動開発のためのドキュメント

このディレクトリは「仕様を書いてからコードを生成する」ための正本（Single Source of Truth）です。
第1版は実装と同時に as-built として整備しています。

開発を始めるときは、先にこの3つを読む。

1. [機能一覧](product/features.md)
2. [テーブル構成](architecture/data-model.md)
3. 該当機能の `docs/specs/<feature-name>/01_requirements.md`

## 構成

```
docs/
├── product/
│   ├── overview.md        # プロダクト概要（何を・誰に・なぜ）
│   └── features.md        # 機能一覧
├── architecture/
│   ├── architecture.md    # 技術構成
│   ├── data-model.md      # テーブル構成
│   └── deploy.md          # 本番の載せ方（Render + Supabase）
├── specs/                 # 機能ごとの仕様書
│   ├── _template/         # コピーして使う
│   └── <feature-name>/
│       ├── 01_requirements.md
│       ├── 02_design.md
│       └── 03_tasks.md
├── api/
│   └── README.md          # Server Action / 公開パス一覧
└── adr/                   # 重要な技術判断
```

## 仕様駆動開発のフロー

1. **機能一覧を見る**: 既存ならその仕様を読む。無ければ `_template/` から `01_requirements.md`
2. **設計**: 要件レビュー後に `02_design.md`
3. **タスク分解**: `03_tasks.md`
4. **実装**: タスク単位で進める
5. **同期**: 実装後に仕様・機能一覧・data-model・`docs/api/README.md` を更新する

## 運用ルール

- 仕様書は日本語で書く
- 実装と仕様がズレたら仕様書を直す
- 大きな技術判断は `docs/adr/` に1ファイル追加する

## クレジット

収支ダッシュボードの情報デザインは [Polimoney](https://github.com/digitaldemocracy2030/polimoney)（AGPL-3.0）を参考にした。ソースは含まない。詳細はリポジトリ直下の `NOTICE`。
