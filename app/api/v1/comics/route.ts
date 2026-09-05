import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { failureResponse, handleApi, jsonError, readJsonBody } from "@/lib/api/http";
import { comicCreateSchema, firstZodMessage } from "@/lib/api/schemas";
import { saveComicStrip } from "@/lib/comics";
import { listComicStrips } from "@/lib/queries";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const url = new URL(request.url);
    const comics = await listComicStrips({
      publishedOnly: url.searchParams.get("published") === "true",
    });
    return NextResponse.json({ comics });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = comicCreateSchema.safeParse(body.value);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION", firstZodMessage(parsed.error));
    }
    const saved = await saveComicStrip({
      title: parsed.data.title,
      imageUrl: parsed.data.imageUrl,
      published: parsed.data.published,
      sortOrder: parsed.data.sortOrder,
    });
    if (!saved.ok) return failureResponse(saved);
    revalidatePublic();
    return NextResponse.json(saved.data, { status: 201 });
  });
}
