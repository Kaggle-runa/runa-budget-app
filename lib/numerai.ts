import { unstable_cache } from "next/cache";
import { NUMERAI_MODELS } from "@/lib/constants";
import { getNumeraiApiToken } from "@/lib/env";
import type {
  NmrQuote,
  NumeraiModelSnapshot,
  NumeraiSnapshot,
  NumeraiWallet,
} from "@/types/domain";

const NUMERAI_API = "https://api-tournament.numer.ai/";

export const NUMERAI_CACHE_TAG = "numerai";

const FETCH_CACHE = { next: { revalidate: 3600, tags: [NUMERAI_CACHE_TAG] } };

const PROFILE_QUERY = `
query($modelName: String!) {
  v3UserProfile(modelName: $modelName) {
    id
    username
    latestReps { corr mmc fncV3 }
    latestRanks { corr mmc fncV3 }
    latestReturns { oneDay threeMonths oneYear }
    stakeValue
  }
}
`;

const WALLET_QUERY = `
query {
  account {
    availableNmr
  }
}
`;

const NMR_PRICE_QUERY = `
query {
  latestNmrPrice {
    priceUsd
    lastUpdated
  }
}
`;

type ProfilePayload = {
  data?: {
    v3UserProfile?: {
      id?: string;
      username?: string;
      latestReps?: { corr?: number | null; mmc?: number | null; fncV3?: number | null } | null;
      latestRanks?: { corr?: number | null; mmc?: number | null; fncV3?: number | null } | null;
      latestReturns?: {
        oneDay?: number | null;
        threeMonths?: number | null;
        oneYear?: number | null;
      } | null;
      stakeValue?: string | number | null;
    } | null;
  };
};

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function emptyModel(meta: (typeof NUMERAI_MODELS)[number]): NumeraiModelSnapshot {
  return {
    name: meta.name,
    headline: meta.headline,
    blurb: meta.blurb,
    id: null,
    corr: null,
    mmc: null,
    fncV3: null,
    corrRank: null,
    mmcRank: null,
    return1d: null,
    nmrStaked: null,
    profileUrl: `https://numer.ai/${meta.name}`,
  };
}

async function numeraiGraphql<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Token ${token}`;
  const response = await fetch(NUMERAI_API, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    ...FETCH_CACHE,
  });
  if (!response.ok) {
    throw new Error(`Numerai API ${response.status}`);
  }
  return (await response.json()) as T;
}

async function fetchProfile(modelName: string): Promise<ProfilePayload["data"]> {
  const json = await numeraiGraphql<ProfilePayload>(PROFILE_QUERY, { modelName });
  return json.data;
}

async function fetchWallet(token: string): Promise<NumeraiWallet | null> {
  try {
    const json = await numeraiGraphql<{
      data?: { account?: { availableNmr?: string | number | null } | null };
      errors?: { message?: string }[];
    }>(WALLET_QUERY, undefined, token);
    if (json.errors?.length || !json.data?.account) return null;
    return { availableNmr: toNumber(json.data.account.availableNmr) };
  } catch {
    return null;
  }
}

async function loadNumeraiSnapshot(): Promise<NumeraiSnapshot> {
  try {
    const token = getNumeraiApiToken();
    const [models, wallet] = await Promise.all([
      Promise.all(
        NUMERAI_MODELS.map(async (meta) => {
          const data = await fetchProfile(meta.name);
          const profile = data?.v3UserProfile;
          return {
            name: meta.name,
            headline: meta.headline,
            blurb: meta.blurb,
            id: profile?.id ?? null,
            corr: toNumber(profile?.latestReps?.corr),
            mmc: toNumber(profile?.latestReps?.mmc),
            fncV3: toNumber(profile?.latestReps?.fncV3),
            corrRank: toNumber(profile?.latestRanks?.corr),
            mmcRank: toNumber(profile?.latestRanks?.mmc),
            return1d: toNumber(profile?.latestReturns?.oneDay),
            nmrStaked: toNumber(profile?.stakeValue),
            profileUrl: `https://numer.ai/${meta.name}`,
          } satisfies NumeraiModelSnapshot;
        })
      ),
      token ? fetchWallet(token) : Promise.resolve(null),
    ]);
    return {
      models,
      wallet,
      fetchedAt: new Date().toISOString(),
      ok: true,
    };
  } catch {
    return {
      models: NUMERAI_MODELS.map(emptyModel),
      wallet: null,
      fetchedAt: null,
      ok: false,
    };
  }
}

export const getNumeraiSnapshot = unstable_cache(
  loadNumeraiSnapshot,
  ["numerai-snapshot-stake-nmr-v2"],
  { revalidate: 3600, tags: [NUMERAI_CACHE_TAG] }
);

export function formatCorr(value: number | null): string {
  if (value === null) return "—";
  return value.toFixed(4);
}

export function formatReturnPct(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatStakeNmr(value: number | null): string {
  if (value === null) return "—";
  return `${value.toLocaleString("ja-JP", { maximumFractionDigits: 4 })} NMR`;
}

export function formatSignedNmr(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("ja-JP", { maximumFractionDigits: 4 })} NMR`;
}

export function stakedNmr(models: NumeraiModelSnapshot[]): number | null {
  const values = models.map((model) => model.nmrStaked).filter((value) => value !== null);
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

export function totalNmr(
  models: NumeraiModelSnapshot[],
  availableNmr: number | null
): number | null {
  const staked = stakedNmr(models);
  if (staked === null && availableNmr === null) return null;
  return (staked ?? 0) + (availableNmr ?? 0);
}

export function toYen(usd: number, usdJpy: number): number {
  return Math.round(usd * usdJpy);
}

export function yenDelta24h(
  usdNow: number,
  change24h: number,
  usdJpy: number
): number | null {
  const factor = 1 + change24h / 100;
  if (factor <= 0) return null;
  return Math.round(usdNow * usdJpy - (usdNow / factor) * usdJpy);
}

export function modelStakeYen(
  model: NumeraiModelSnapshot,
  quote: NmrQuote
): number | null {
  if (model.nmrStaked === null || quote.usdPrice === null || quote.usdJpy === null) {
    return null;
  }
  return toYen(model.nmrStaked * quote.usdPrice, quote.usdJpy);
}

export function stakedYenTotal(
  models: NumeraiModelSnapshot[],
  quote: NmrQuote
): number | null {
  const values = models
    .map((model) => modelStakeYen(model, quote))
    .filter((value): value is number => value !== null);
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

export function isModelTraining(model: NumeraiModelSnapshot): boolean {
  return model.corr === null && model.mmc === null && model.corrRank === null;
}

type GeckoNmr = {
  usdPrice: number | null;
  change24h: number | null;
  jpyPrice: number | null;
};

async function loadGeckoNmr(): Promise<GeckoNmr> {
  const empty = { usdPrice: null, change24h: null, jpyPrice: null };
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=numeraire&vs_currencies=usd,jpy&include_24hr_change=true",
      {
        ...FETCH_CACHE,
        headers: { Accept: "application/json" },
      }
    );
    if (!response.ok) return empty;
    const json = (await response.json()) as {
      numeraire?: {
        usd?: number;
        jpy?: number;
        usd_24h_change?: number;
      };
    };
    const coin = json.numeraire;
    return {
      usdPrice: finiteNumber(coin?.usd),
      change24h: finiteNumber(coin?.usd_24h_change),
      jpyPrice: finiteNumber(coin?.jpy),
    };
  } catch {
    return empty;
  }
}

async function loadNumeraiNmrUsd(): Promise<number | null> {
  try {
    const json = await numeraiGraphql<{
      data?: { latestNmrPrice?: { priceUsd?: string | null } | null };
    }>(NMR_PRICE_QUERY);
    return toNumber(json.data?.latestNmrPrice?.priceUsd);
  } catch {
    return null;
  }
}

async function loadUsdJpy(): Promise<number | null> {
  const sources = [
    "https://open.er-api.com/v6/latest/USD",
    "https://api.frankfurter.dev/v1/latest?base=USD&symbols=JPY",
  ];
  for (const url of sources) {
    try {
      const response = await fetch(url, FETCH_CACHE);
      if (!response.ok) continue;
      const json = (await response.json()) as { rates?: { JPY?: number } };
      const jpy = finiteNumber(json.rates?.JPY);
      if (jpy !== null && jpy > 0) return jpy;
    } catch {
      // 次のソースへ
    }
  }
  return null;
}

async function loadChange24h(geckoChange: number | null): Promise<number | null> {
  if (geckoChange !== null) return geckoChange;

  try {
    const response = await fetch(
      "https://api.coinpaprika.com/v1/tickers/nmr-numeraire",
      FETCH_CACHE
    );
    if (response.ok) {
      const json = (await response.json()) as {
        quotes?: { USD?: { percent_change_24h?: number } };
      };
      const value = finiteNumber(json.quotes?.USD?.percent_change_24h);
      if (value !== null) return value;
    }
  } catch {
    // 次へ
  }

  try {
    const response = await fetch(
      "https://api.binance.com/api/v3/ticker/24hr?symbol=NMRUSDT",
      FETCH_CACHE
    );
    if (response.ok) {
      const json = (await response.json()) as { priceChangePercent?: string };
      const value = toNumber(json.priceChangePercent);
      if (value !== null) return value;
    }
  } catch {
    // 取れなければ null
  }

  return null;
}

async function loadNmrQuote(): Promise<NmrQuote> {
  const [gecko, numeraiUsd, usdJpyDirect] = await Promise.all([
    loadGeckoNmr(),
    loadNumeraiNmrUsd(),
    loadUsdJpy(),
  ]);
  const usdPrice = numeraiUsd ?? gecko.usdPrice;
  const implied =
    gecko.usdPrice !== null && gecko.usdPrice > 0 && gecko.jpyPrice !== null
      ? gecko.jpyPrice / gecko.usdPrice
      : null;
  const change24h = await loadChange24h(gecko.change24h);
  return {
    usdPrice,
    change24h,
    usdJpy: usdJpyDirect ?? implied,
  };
}

export const getNmrQuote = unstable_cache(loadNmrQuote, ["nmr-quote-fx-v3"], {
  revalidate: 3600,
  tags: [NUMERAI_CACHE_TAG],
});
