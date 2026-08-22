import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  SESSION_TTL_MS,
  signSession,
  verifySession,
} from "@/lib/auth/crypto";
import { getEnv } from "@/lib/env";

export { COOKIE_NAME, verifySession };

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySession(token, getEnv().ADMIN_SECRET);
}

export async function requireAdmin(): Promise<void> {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    throw new Error("管理者権限が必要です");
  }
}

export async function setSessionCookie(): Promise<void> {
  const env = getEnv();
  const token = await signSession(env.ADMIN_SECRET);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
