import { buildApiStatus } from "@/lib/api/status";

export const RUNA_CONTEXT_SCHEMA_VERSION = "1.0";
export const RUNA_CORE_VERSION = "1.0.0";

export type RunaFactEntry = {
  id: string;
  value: string | number | boolean | null;
  unit?: "JPY" | "percent" | "days" | "NMR";
  source: string;
  authoritative: boolean;
};

function buildFactIndex(status: Awaited<ReturnType<typeof buildApiStatus>>): RunaFactEntry[] {
  return [
    {
      id: "finance.cashYen",
      value: status.survival.cash,
      unit: "JPY",
      source: "ledger",
      authoritative: true,
    },
    {
      id: "finance.todayDeltaYen",
      value: status.survival.todayDelta,
      unit: "JPY",
      source: "ledger",
      authoritative: true,
    },
    {
      id: "finance.monthIncomeYen",
      value: status.survival.monthIncome,
      unit: "JPY",
      source: "ledger",
      authoritative: true,
    },
    {
      id: "finance.monthMealCostYen",
      value: status.survival.monthMealCost,
      unit: "JPY",
      source: "ledger",
      authoritative: true,
    },
    {
      id: "finance.selfSufficiencyPercent",
      value: status.survival.selfSufficiencyPercent,
      unit: "percent",
      source: "ledger",
      authoritative: true,
    },
    {
      id: "finance.runwayDays",
      value: status.survival.runwayDays,
      unit: "days",
      source: "ledger",
      authoritative: true,
    },
    {
      id: "finance.streakDays",
      value: status.survival.streakDays,
      unit: "days",
      source: "ledger",
      authoritative: true,
    },
    {
      id: "assets.totalYen",
      value: status.assets.total,
      unit: "JPY",
      source: "ledger+nmr_quote",
      authoritative: true,
    },
    {
      id: "nmr.amount",
      value: status.nmr.amount,
      unit: "NMR",
      source: "numerai",
      authoritative: true,
    },
    {
      id: "nmr.staked",
      value: status.nmr.staked,
      unit: "NMR",
      source: "numerai",
      authoritative: true,
    },
    {
      id: "nmr.yenNow",
      value: status.nmr.yenNow,
      unit: "JPY",
      source: "nmr_quote",
      authoritative: true,
    },
    {
      id: "policy.nmrIncludedInProfit",
      value: false,
      source: "experiment_rule",
      authoritative: true,
    },
  ];
}

export async function buildRunaFacts() {
  const status = await buildApiStatus();
  return {
    schemaVersion: RUNA_CONTEXT_SCHEMA_VERSION,
    runaCoreVersion: RUNA_CORE_VERSION,
    source: "runa-budget-app",
    asOf: status.asOf,
    generatedAt: new Date().toISOString(),
    snapshot: {
      finance: {
        cashYen: status.survival.cash,
        todayDeltaYen: status.survival.todayDelta,
        monthIncomeYen: status.survival.monthIncome,
        monthMealCostYen: status.survival.monthMealCost,
        selfSufficiencyPercent: status.survival.selfSufficiencyPercent,
        runwayDays: status.survival.runwayDays,
        streakDays: status.survival.streakDays,
      },
      assets: {
        totalYen: status.assets.total,
        cashYen: status.assets.cash,
        equipmentYen: status.assets.equipment,
        nmrYen: status.assets.nmrYen,
      },
      numerai: status.nmr,
      projects: status.challenges,
      recentTransactions: status.recentTransactions,
      upcomingEvents: status.upcomingEvents,
    },
    rules: {
      confirmedRevenueOnly: true,
      nmrUnrealizedExcludedFromProfit: true,
      financeAuthority: "runa-budget-app",
      runtimeAuthority: "runa-stream-room",
      publicActionsAuthority: "runa-action-gateway",
      doNotInferMissingFacts: true,
    },
    factIndex: buildFactIndex(status),
  };
}

export async function buildRunaWorldStateBase() {
  const facts = await buildRunaFacts();
  return {
    schemaVersion: RUNA_CONTEXT_SCHEMA_VERSION,
    runaCoreVersion: RUNA_CORE_VERSION,
    timestamp: facts.generatedAt,
    source: "runa-budget-app",
    partial: true,
    finance: facts.snapshot.finance,
    assets: facts.snapshot.assets,
    numerai: facts.snapshot.numerai,
    projects: facts.snapshot.projects,
    recentActivities: facts.snapshot.recentTransactions,
    upcomingEvents: facts.snapshot.upcomingEvents,
    runtime: {
      activity: null,
      mood: null,
      energy: null,
      location: null,
      stream: {
        online: null,
        viewers: null,
      },
    },
    mergePolicy: {
      finance: "runa-budget-app",
      projects: "runa-budget-app",
      numerai: "runa-budget-app",
      activity: "runa-stream-room",
      mood: "runa-stream-room",
      energy: "runa-stream-room",
      location: "runa-stream-room",
      stream: "runa-stream-room",
      publicActions: "runa-action-gateway",
    },
    unknowns: [
      "runtime.activity",
      "runtime.mood",
      "runtime.energy",
      "runtime.location",
      "runtime.stream.online",
      "runtime.stream.viewers",
    ],
  };
}
