import type { EventKind, IdeaStatus, ProjectStatus } from "@/lib/categories";

export type TxType = "income" | "expense" | "loan" | "repay" | "capex";

export type TransactionDTO = {
  id: string;
  date: string;
  type: TxType;
  amount: number;
  category: string;
  title: string;
  memo: string | null;
  projectId: string | null;
  projectTitle: string | null;
};

export type EventDTO = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  kind: EventKind | string;
  body: string | null;
  linkUrl: string | null;
  projectId: string | null;
  projectTitle: string | null;
  announcementId: string | null;
  announcementTitle: string | null;
  announcementPublished: boolean;
};

export type IdeaDTO = {
  id: string;
  displayName: string;
  title: string;
  body: string;
  status: IdeaStatus | string;
  projectId: string | null;
  createdAt: string;
};

export type ProjectDTO = {
  id: string;
  title: string;
  status: ProjectStatus | string;
};

export type MonthlyPoint = {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
};

export type CategorySlice = {
  key: string;
  label: string;
  amount: number;
};

export type KpiSummary = {
  incomeTotal: number;
  expenseTotal: number;
  net: number;
  balance: number;
  asOf: string;
};

export type BalanceSheet = {
  cash: number;
  equipment: number;
  loan: number;
  equity: number;
  assets: number;
  incomeTotal: number;
  expenseTotal: number;
  loanIn: number;
  repayOut: number;
  capexOut: number;
};

export type CashFlowSide = {
  key: string;
  label: string;
  amount: number;
  kind: "income" | "expense" | "balance" | "deficit" | "loan" | "repay" | "capex";
};

export type ComicStripDTO = {
  id: string;
  title: string;
  imageUrl: string;
  published: boolean;
  sortOrder: number;
};

export type AnnouncementDTO = {
  id: string;
  title: string;
  body: string;
  category: string;
  publishedAt: string;
  coverUrl: string | null;
  published: boolean;
};

export type CashFlowGraph = {
  left: CashFlowSide[];
  right: CashFlowSide[];
  total: number;
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
};
