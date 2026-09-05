import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { saveAnnouncement } from "@/lib/announcements";
import { failureResponse, handleApi, jsonError, readJsonBody } from "@/lib/api/http";
import {
  announcementCreateSchema,
  firstZodMessage,
  parseOptionalAnnouncementCategory,
} from "@/lib/api/schemas";
import { listAnnouncements } from "@/lib/queries";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const url = new URL(request.url);
    const published = url.searchParams.get("published");
    const categoryParsed = parseOptionalAnnouncementCategory(
      url.searchParams.get("category")
    );
    if (!categoryParsed.ok) return failureResponse(categoryParsed.error);
    const announcements = await listAnnouncements({
      publishedOnly: published === "true",
      category: categoryParsed.category,
    });
    return NextResponse.json({ announcements });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = announcementCreateSchema.safeParse(body.value);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION", firstZodMessage(parsed.error));
    }
    const saved = await saveAnnouncement({
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category,
      publishedAt: parsed.data.publishedAt,
      coverUrl: parsed.data.coverUrl ?? null,
      published: parsed.data.published,
    });
    if (!saved.ok) return failureResponse(saved);
    revalidatePublic();
    return NextResponse.json(saved.data, { status: 201 });
  });
}
