import type { ProjectLink } from "@/types/domain";

export const PROJECT_LINK_KINDS = {
  youtube: "YouTube",
  note: "note",
  other: "その他",
} as const;

export type ProjectLinkKind = keyof typeof PROJECT_LINK_KINDS;

const KINDS = new Set(Object.keys(PROJECT_LINK_KINDS));

export function normalizeHttpUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function parseProjectLinks(value: unknown): ProjectLink[] {
  let raw: unknown = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  const links: ProjectLink[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as { kind?: unknown; label?: unknown; url?: unknown };
    const kind = typeof row.kind === "string" && KINDS.has(row.kind) ? row.kind : "other";
    const url = normalizeHttpUrl(typeof row.url === "string" ? row.url : "");
    if (!url) continue;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") continue;
    } catch {
      continue;
    }
    const label =
      typeof row.label === "string" && row.label.trim()
        ? row.label.trim().slice(0, 40)
        : PROJECT_LINK_KINDS[kind as ProjectLinkKind];
    links.push({ kind: kind as ProjectLinkKind, label, url });
  }
  return links.slice(0, 8);
}

export function youtubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
        return parts[1] ?? null;
      }
    }
    return null;
  } catch {
    return null;
  }
}
