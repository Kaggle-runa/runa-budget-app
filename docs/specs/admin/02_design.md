# 設計: 管理画面

middleware は Cookie 検証のみ。Action 側でも `requireAdmin()`。
フォームは zod。カテゴリは区分に応じて切り替える。
