import { NextResponse } from "next/server";
import { apiTokensMatch, getRunaApiReadToken, getRunaApiToken, readBearerToken } from "@/lib/api/auth";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    hint?: string;
  };
};

export type ApiFailure = {
  ok: false;
  status: number;
  code: string;
  message: string;
  hint?: string;
};

export function fail(
  status: number,
  code: string,
  message: string,
  hint?: string
): ApiFailure {
  return { ok: false, status, code, message, hint };
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  hint?: string
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { error: { code, message, ...(hint ? { hint } : {}) } },
    { status }
  );
}

export function failureResponse(error: ApiFailure): NextResponse<ApiErrorBody> {
  return jsonError(error.status, error.code, error.message, error.hint);
}

export type ApiAuthDecision =
  | { ok: true }
  | { ok: false; status: number; code: string; message: string; hint?: string };

export function decideApiAuth(input: {
  method: string;
  writeConfigured: boolean;
  readConfigured: boolean;
  provided: boolean;
  isWrite: boolean;
  isRead: boolean;
}): ApiAuthDecision {
  if (!input.writeConfigured && !input.readConfigured) {
    return {
      ok: false,
      status: 503,
      code: "TOKEN_UNSET",
      message: "APIトークンがサーバーに設定されていないよ",
      hint: "環境変数 RUNA_API_TOKEN（読み書き）か RUNA_API_READ_TOKEN（GETのみ）を16文字以上で入れてね",
    };
  }
  if (!input.provided) {
    return {
      ok: false,
      status: 401,
      code: "UNAUTHORIZED",
      message: "認証できないよ",
      hint: "Authorization: Bearer <token> を付けてね",
    };
  }
  const needsWrite = input.method !== "GET" && input.method !== "HEAD";
  if (needsWrite) {
    if (input.isWrite) return { ok: true };
    if (input.isRead) {
      return {
        ok: false,
        status: 401,
        code: "UNAUTHORIZED",
        message: "読み取り専用トークンでは登録できないよ",
        hint: "書き込みは RUNA_API_TOKEN か Action Gateway からにしてね",
      };
    }
    return {
      ok: false,
      status: 401,
      code: "UNAUTHORIZED",
      message: "認証できないよ",
      hint: "Authorization: Bearer <RUNA_API_TOKEN> を付けてね",
    };
  }
  if (input.isWrite || input.isRead) return { ok: true };
  return {
    ok: false,
    status: 401,
    code: "UNAUTHORIZED",
    message: "認証できないよ",
    hint: "Authorization: Bearer <token> を付けてね",
  };
}

export function requireApiAuth(request: Request): NextResponse<ApiErrorBody> | null {
  const write = getRunaApiToken();
  const read = getRunaApiReadToken();
  const provided = readBearerToken(request);
  const decided = decideApiAuth({
    method: request.method,
    writeConfigured: Boolean(write),
    readConfigured: Boolean(read),
    provided: Boolean(provided),
    isWrite: Boolean(write && provided && apiTokensMatch(provided, write)),
    isRead: Boolean(read && provided && apiTokensMatch(provided, read)),
  });
  if (decided.ok) return null;
  return jsonError(decided.status, decided.code, decided.message, decided.hint);
}

export async function handleApi(
  request: Request,
  run: () => Promise<Response>
): Promise<Response> {
  const denied = requireApiAuth(request);
  if (denied) return denied;
  try {
    return await run();
  } catch (error) {
    console.error("api handler failed", error);
    return jsonError(500, "INTERNAL", "処理に失敗しました");
  }
}

export async function readJsonBody(request: Request): Promise<
  { ok: true; value: unknown } | { ok: false; response: NextResponse<ApiErrorBody> }
> {
  try {
    return { ok: true, value: await request.json() };
  } catch {
    return {
      ok: false,
      response: jsonError(
        400,
        "VALIDATION",
        "JSONが読めないよ",
        "Content-Type: application/json で、正しいJSONを送ってね"
      ),
    };
  }
}
