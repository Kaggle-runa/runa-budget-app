import { NextResponse } from "next/server";
import { handleApi } from "@/lib/api/http";
import { buildRunaFacts } from "@/lib/api/runa-context";

export async function GET(request: Request) {
  return handleApi(request, async () => NextResponse.json(await buildRunaFacts()));
}
