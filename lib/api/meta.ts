import {
  ANNOUNCEMENT_CATEGORIES,
  CAPEX_CATEGORIES,
  EVENT_KINDS,
  EXPENSE_CATEGORIES,
  IDEA_STATUSES,
  INCOME_CATEGORIES,
  LOAN_CATEGORIES,
  PROJECT_STATUSES,
  REPAY_CATEGORIES,
  TX_TYPES,
} from "@/lib/categories";

export function buildApiMeta() {
  return {
    currency: "JPY",
    dateFormat: "yyyy-MM-dd",
    datetimeFormat: "ISO-8601",
    transactionTypes: TX_TYPES,
    categories: {
      income: INCOME_CATEGORIES,
      expense: EXPENSE_CATEGORIES,
      loan: LOAN_CATEGORIES,
      repay: REPAY_CATEGORIES,
      capex: CAPEX_CATEGORIES,
    },
    eventKinds: EVENT_KINDS,
    projectStatuses: PROJECT_STATUSES,
    announcementCategories: ANNOUNCEMENT_CATEGORIES,
    ideaStatuses: IDEA_STATUSES,
    notes: [
      "金額は円の正の整数。",
      "損益（自給率・カレンダーの収支）は income と expense だけ。",
      "NMR の円換算は status.nmr に出るが、損益・自給率には入れない。",
      "現金が負になる登録、借入残高を超える返済は 422 SOLVENCY。",
      "お知らせ・4コマの画像は公開URLを渡す。ファイルアップロードは管理画面。",
      "明細・予定・募集案が付いている挑戦、予定が付いているお知らせは 422 CONFLICT。",
    ],
  };
}
