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
import { RUNA_CONTEXT_SCHEMA_VERSION, RUNA_CORE_VERSION } from "@/lib/api/runa-context";

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
    runaCore: {
      character: "kagu_runa",
      version: RUNA_CORE_VERSION,
      contextSchemaVersion: RUNA_CONTEXT_SCHEMA_VERSION,
      endpoints: {
        facts: "/api/v1/facts",
        worldState: "/api/v1/world-state",
      },
      sourceOfTruth: {
        finance: "runa-budget-app",
        projects: "runa-budget-app",
        numerai: "runa-budget-app",
        runtime: "runa-stream-room",
        publicActions: "runa-action-gateway",
      },
      rules: [
        "キャラクターらしさのために事実を作らない。",
        "金額・収益・日付・件数は facts / world-state の値を正本にする。",
        "確定した収益だけを収益として扱う。見込みは数えない。",
        "NMRの円換算は総資産には含むが、損益・自給率には入れない。",
        "world-state は部分状態。activity / mood / energy / location / stream は runa-stream-room が補完する。",
        "投稿・公開・外部サービスへの書き込みは runa-action-gateway の認可を通す。",
      ],
    },
    notes: [
      "金額は円の正の整数。",
      "損益（自給率・カレンダーの収支）は income と expense だけ。",
      "NMR の円換算は status.nmr に出るが、損益・自給率には入れない。",
      "現金が負になる登録、借入残高を超える返済は 422 SOLVENCY。",
      "お知らせ・4コマの画像は公開URLを渡す。ファイルアップロードは管理画面。",
      "明細・予定・募集案が付いている挑戦、予定が付いているお知らせは 422 CONFLICT。",
      "LLM は最初に /api/v1/meta を読み、人格と事実を混ぜずに扱う。",
    ],
  };
}
