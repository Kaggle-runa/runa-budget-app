import { NextResponse } from "next/server";
import { handleApi } from "@/lib/api/http";
import { buildApiMeta } from "@/lib/api/meta";

export async function GET(request: Request) {
  return handleApi(request, async () => NextResponse.json(buildApiMeta()));
}
