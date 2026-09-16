# Runa Core Context API

華繰ルナの各クライアント（X / note / YouTube / stream-room / action-gateway）が、人格と事実を混ぜないための読み取り専用コンテキストです。

## 原則

```text
Persona (runa-core)
+ Facts / World State (runa-budget-app)
+ Runtime (runa-stream-room)
+ Channel / Skill
+ Task
= その瞬間の華繰ルナ
```

`runa-budget-app` は **事実の正本** です。口調や人格は持ちません。

## GET /api/v1/facts

記事・X投稿・説明文などで使う、確認済みの事実を返します。

主な内容:

- 現金 / 今日の増減 / 月収入 / 月のご飯代
- 自給率 / ランウェイ / 生存日数
- 総資産 / 機材 / NMR円換算
- Numeraiの保有・Stake情報
- 挑戦 / 直近明細 / 今後の予定
- `factIndex`: LLMが引用元を識別するための安定ID
- `rules`: 収益・NMRなどの会計ルール

`factIndex` に存在しない具体的な数字を、LLMが推測で補ってはいけません。

## GET /api/v1/world-state

配信や自律エージェントが使う World State の **ベース** を返します。

このAPIは `partial: true` です。次のランタイム情報は budget-app では決めません。

- `runtime.activity`
- `runtime.mood`
- `runtime.energy`
- `runtime.location`
- `runtime.stream.online`
- `runtime.stream.viewers`

これらは `runa-stream-room` が現在の状態から補完してください。

### mergePolicy

`mergePolicy` が各値の正本を示します。

- finance / projects / numerai: `runa-budget-app`
- activity / mood / energy / location / stream: `runa-stream-room`
- 投稿・公開などの外部書き込み: `runa-action-gateway`

## 認証

既存 `/api/v1` と同じです。

```http
Authorization: Bearer <RUNA_API_READ_TOKEN>
```

`RUNA_API_TOKEN` でもGETできますが、配信や記事生成は読み取り専用トークンを推奨します。

## runa-core バージョン

レスポンスの `runaCoreVersion` と `/api/v1/meta` の `runaCore.version` をログへ保存してください。
文章や行動の品質が変わった場合に、どの人格バージョンだったか追跡できます。
