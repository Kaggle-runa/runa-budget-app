export const INCOME_CATEGORIES = {
  ads: "広告収入",
  superchat: "スーパーチャット",
  merch: "物販",
  affiliate: "アフィリエイト",
  support: "支援金",
  ai_hustle: "事業収入",
} as const;

export const EXPENSE_CATEGORIES = {
  llm_api: "生成AI利用料",
  voice: "音声合成",
  hosting: "ホスティング",
  tools: "ツール",
  other: "その他",
} as const;

export const LOAN_CATEGORIES = {
  master_loan: "マスター借入",
} as const;

export const REPAY_CATEGORIES = {
  master_repay: "マスター借入",
} as const;

export const CAPEX_CATEGORIES = {
  equipment: "機材",
} as const;

export const TX_TYPES = {
  income: "収入",
  expense: "支出",
  loan: "借入",
  repay: "返済",
  capex: "機材購入",
} as const;

export type TxTypeKey = keyof typeof TX_TYPES;

export const ALL_CATEGORIES = {
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
  ...LOAN_CATEGORIES,
  ...REPAY_CATEGORIES,
  ...CAPEX_CATEGORIES,
} as const;

export type IncomeCategory = keyof typeof INCOME_CATEGORIES;
export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES;
export type CategoryKey = keyof typeof ALL_CATEGORIES;

export const ANNOUNCEMENT_CATEGORIES = {
  news: "お知らせ",
  stream: "配信",
  other: "その他",
} as const;

export type AnnouncementCategory = keyof typeof ANNOUNCEMENT_CATEGORIES;

export function announcementCategoryLabel(key: string): string {
  return ANNOUNCEMENT_CATEGORIES[key as AnnouncementCategory] ?? key;
}

export const EVENT_KINDS = {
  stream: "配信",
  release: "公開",
  project: "企画",
  other: "その他",
} as const;

export type EventKind = keyof typeof EVENT_KINDS;

export const IDEA_STATUSES = {
  submitted: "募集中",
  reviewing: "検討中",
  adopted: "採用",
  in_progress: "実施中",
  done: "完了",
} as const;

export type IdeaStatus = keyof typeof IDEA_STATUSES;

export const PROJECT_STATUSES = {
  planned: "予定",
  active: "進行中",
  completed: "完了",
} as const;

export type ProjectStatus = keyof typeof PROJECT_STATUSES;

export function categoryLabel(key: string): string {
  return ALL_CATEGORIES[key as CategoryKey] ?? key;
}

export function txTypeLabel(key: string): string {
  return TX_TYPES[key as TxTypeKey] ?? key;
}

export function categoriesForType(type: TxTypeKey): Record<string, string> {
  if (type === "income") return INCOME_CATEGORIES;
  if (type === "expense") return EXPENSE_CATEGORIES;
  if (type === "loan") return LOAN_CATEGORIES;
  if (type === "repay") return REPAY_CATEGORIES;
  return CAPEX_CATEGORIES;
}

export function eventKindLabel(key: string): string {
  return EVENT_KINDS[key as EventKind] ?? key;
}

export function ideaStatusLabel(key: string): string {
  return IDEA_STATUSES[key as IdeaStatus] ?? key;
}

export function projectStatusLabel(key: string): string {
  return PROJECT_STATUSES[key as ProjectStatus] ?? key;
}
