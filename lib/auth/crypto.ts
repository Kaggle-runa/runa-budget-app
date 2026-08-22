export const COOKIE_NAME = "runa_admin_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function signSession(secret: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const sig = await hmacHex(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySession(
  token: string,
  secret: string
): Promise<boolean> {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (Number.isNaN(Number(payload)) || Date.now() > Number(payload)) {
    return false;
  }
  const expected = await hmacHex(secret, payload);
  return timingSafeEqual(sig, expected);
}
