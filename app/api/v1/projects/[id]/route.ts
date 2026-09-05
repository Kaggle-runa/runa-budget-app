import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { failureResponse, handleApi, jsonError, readJsonBody } from "@/lib/api/http";
import { firstZodMessage, projectPatchSchema, projectStatusSchema } from "@/lib/api/schemas";
import { removeProject, saveProject } from "@/lib/projects";
import { getProject } from "@/lib/queries";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const row = await getProject(id);
    if (!row) return jsonError(404, "NOT_FOUND", "その挑戦は無いよ");
    return NextResponse.json(row);
  });
}

export async function PATCH(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const current = await getProject(id);
    if (!current) return jsonError(404, "NOT_FOUND", "その挑戦は無いよ");
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = projectPatchSchema.safeParse(body.value);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION", firstZodMessage(parsed.error));
    }
    const statusParsed = projectStatusSchema.safeParse(
      parsed.data.status ?? current.status
    );
    if (!statusParsed.success) {
      return jsonError(400, "VALIDATION", "ステータスが不正です");
    }
    const saved = await saveProject({
      id,
      title: parsed.data.title ?? current.title,
      status: statusParsed.data,
      masterNote:
        parsed.data.masterNote === undefined
          ? current.masterNote
          : parsed.data.masterNote,
      overview:
        parsed.data.overview === undefined ? current.overview : parsed.data.overview,
      links: parsed.data.links === undefined ? current.links : parsed.data.links,
    });
    if (!saved.ok) return failureResponse(saved);
    revalidatePublic();
    return NextResponse.json(saved.data);
  });
}

export async function DELETE(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const removed = await removeProject(id);
    if (!removed.ok) return failureResponse(removed);
    revalidatePublic();
    return NextResponse.json({ ok: true, id });
  });
}
