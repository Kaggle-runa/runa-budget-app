# 設計: 企画募集

`/ideas` に投稿フォームと一覧。採用・実施中・完了は `/ideas/[id]` で詳細（結果と金額・明細の下に、企画の概要と note / YouTube の別カード）。
挑戦の `links` に YouTube / note などを置く。YouTube は埋め込みとリンクボタンの両方。
挑戦に紐づいていない完了プロジェクトは `/ideas/p/[projectId]`。
公開 Action は `submitIdeaAction`。管理は `updateIdeaStatusAction`（状態と挑戦の紐づけ）。
