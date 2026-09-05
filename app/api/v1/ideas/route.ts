import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { failureResponse, handleApi, jsonError, readJsonBody } from "@/lib/api/http";
import {
  firstZodMessage,
  ideaCreateSchema,
  parseOptionalIdeaStatus,
} from "@/lib/api/schemas";
import { saveIdea } from "@/lib/ideas";
import { listIdeas } from "@/lib/queries";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const url = new URL(request.url);
    const statusParsed = parseOptionalIdeaStatus(url.searchParams.get("status"));
    if (!statusParsed.ok) return failureResponse(statusParsed.error);
    const ideas = await listIdeas({ status: statusParsed.status });
    return NextResponse.json({ ideas });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = ideaCreateSchema.safeParse(body.value);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION", firstZodMessage(parsed.error));
    }
    const saved = await saveIdea({
      displayName: parsed.data.displayName ?? "匿名",
      title: parsed.data.title,
      body: parsed.data.body,
      status: parsed.data.status ?? "submitted",
      projectId: parsed.data.projectId ?? null,
    });
    if (!saved.ok) return failureResponse(saved);
    revalidatePublic();
    return NextResponse.json(saved.data, { status: 201 });
  });
}
