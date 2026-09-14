# タスク: 自動取込（冪等とトークン分離）

> これが Gateway コネクタより先。

## 実装タスク

- [x] 1. Prisma: Transaction に source / sourceEventId と unique。冪等表
- [x] 2. `docs/architecture/data-model.md` を更新
- [x] 3. POST transactions の重複判定と 200 / 201
- [x] 4. `RUNA_API_READ_TOKEN`。GET のみ
- [x] 5. 読み取りトークンで POST が 401 になるテスト（またはスクリプト）
- [x] 6. 同じ sourceEventId と Idempotency-Key の再 POST テスト（ハッシュとキー。DB 再送は `createOrReplayTransaction`）
- [x] 7. `docs/api/openapi.yaml` と `.env.example`

## 仕上げタスク

- [x] machine-api の SHOULD（冪等・トークン分離）をこの仕様へリンクして [x] にする
- [x] features.md に ingest を足す
- [x] `npm run lint && npm run typecheck`
