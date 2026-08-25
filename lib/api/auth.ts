import { createHash, timingSafeEqual } from "node:crypto";
import { getEnv } from "@/lib/env";

export function getRunaApiToken(): string | undefined {
  const token = getEnv().RUNA_API_TOKEN?.trim();
  return token ? token : undefined;
}

function hashed(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function apiTokensMatch(provided: string, expected: string): boolean {
  return timingSafeEqual(hashed(provided), hashed(expected));
}

export function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token;
}
