import { NextResponse } from "next/server";
import { handleApi } from "@/lib/api/http";
import { buildApiStatus } from "@/lib/api/status";

export async function GET(request: Request) {
  return handleApi(request, async () => NextResponse.json(await buildApiStatus()));
}
