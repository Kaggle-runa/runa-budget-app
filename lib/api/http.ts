import { NextResponse } from "next/server";
import { apiTokensMatch, getRunaApiToken, readBearerToken } from "@/lib/api/auth";

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

export function requireApiAuth(request: Request): NextResponse<ApiErrorBody> | null {
  const expected = getRunaApiToken();
  if (!expected) {
    return jsonError(
      503,
      "TOKEN_UNSET",
      "APIトークンがサーバーに設定されていないよ",
      "環境変数 RUNA_API_TOKEN を16文字以上で入れてね"
    );
  }
  const provided = readBearerToken(request);
  if (!provided || !apiTokensMatch(provided, expected)) {
    return jsonError(
      401,
      "UNAUTHORIZED",
      "認証できないよ",
      "Authorization: Bearer <RUNA_API_TOKEN> を付けてね"
    );
  }
  return null;
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
