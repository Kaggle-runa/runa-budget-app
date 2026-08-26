# specs/ — 機能仕様書

機能の一覧と状態は [product/features.md](../product/features.md) を正とする。
テーブルは [architecture/data-model.md](../architecture/data-model.md)。

```
docs/specs/
├── _template/
├── channel-home/
├── dashboard/
├── balance-sheet/
├── calendar/
├── ledger/
├── idea-submissions/
├── project-challenges/
├── announcements/
├── yonkoma/
├── survival-experiment/
├── live-status/
├── machine-api/
├── contact/
├── admin/
├── motion/
└── deploy/
```

## 進め方

1. [機能一覧](../product/features.md) を見て、既存機能か新機能かを決める
2. 既存ならその `01_requirements.md` を読んでから直す
3. 新機能なら `_template/` をコピーして `01_requirements.md` を書き、レビューを待つ
4. 承認後に `02_design.md` → `03_tasks.md`
5. タスク単位で実装し、完了したら `[x]`
6. テーブルや更新経路が変わったら data-model と api を直す
