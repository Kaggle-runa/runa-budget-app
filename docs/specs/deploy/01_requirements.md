# 要件定義: デプロイ

## 概要

個人開発の無料枠で、公開サイトと管理画面を本番公開する。

## 背景・目的

SQLite のままでは本番共有ができない。Supabase は用意済み。ホスティングはコストをかけたくない。

## ユーザーストーリー

- 運営として、月額0円に近い状態でチャンネルの顔を公開したい。
- 運営として、GitHub に push したらデプロイされてほしい。

## 機能要件

### 必須（MUST）

- [x] Prisma を Supabase Postgres に向ける
- [x] pooler 用と migrate 用の接続文字列を分ける
- [x] 推奨ホスティング手順を docs に書く
- [x] Render 用の Blueprint（`render.yaml`）を置く

### 任意（SHOULD / MAY）

- [ ] OpenNext で Cloudflare Workers に載せる
- [ ] GitHub Actions からの自動 migrate

## スコープ外

- フロント/API の分離
- Redis
- 独自ドメイン取得の代行
