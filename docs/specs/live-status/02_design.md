# 設計: 実況トップ・Numerai 観察

## 画面構成

| パス | 画面 | 概要 |
|------|------|------|
| `/numerai` | ルナのモデル観察 | ヒーロー（Stake総額）→ モデルカード → ルナのひとこと → Numerai の短い説明 |

トップのヒーロー直下は総資産（現金 + 機材 + NMR円）。「いまのルナの状況」は [dashboard](../dashboard/02_design.md) と [channel-home](../channel-home/02_design.md)。

## `/numerai` の順序

1. ヒーロー: 「僕自身がAIなのに、AIモデルを育ててるよ。」Stake総額（円）とモデル数
2. モデルカード: 1号機 / 2号機。主役は Stake の円。CORR / MMC / Rank は一段小さく
3. ルナのひとこと: API の数字からルールで一文。LLM は使わない
4. Numeraiってなに: 2段落 + 「もう少し詳しく見る」
5. CORR / MMC / Stake の3カード（見出し直下に一言）
6. 評価待ちカード（20日 / 60日、未確定 payout は帳簿に入れない）
7. Docs / 日本語 Tips

## コンポーネント

```
components/numerai/
├── hero.tsx
├── model-card.tsx
├── comment.tsx
└── intro.tsx
```

集計と API は `lib/numerai.ts`。ひとことの文言は `lib/numerai-copy.ts`。

## モデルカード

成績があるモデル:

- バッジ: メインモデル / 稼働中
- いちばん大きい数字: Stake の円換算
- グループ: 総合ステータス（CORR / MMC / Rank）、直近1日（`latestReturns.oneDay`）

成績がまだ無いモデル:

- バッジ: 育成中
- 進捗率は出さない（厳密な % が取れない）
- 「スコアが出るまで待っててね」

## ひとこと

優先順: API失敗 → NMR円の大きな前日比 → メインモデルの CORR / 直近成績 → 育成中 → 既定。
帳簿の損益には入れない。

## 更新経路

読み取りのみ。Numerai GraphQL と価格は `getNumeraiSnapshot` / `getNmrQuote`（1時間キャッシュ）。

## 第1版でやらない

モデル比較表、提出バージョン履歴、LLM 短評、評価の進捗バー。
