import { prisma } from "@/lib/db";
import { fail, type ApiFailure } from "@/lib/api/http";
import type { ComicStripDTO } from "@/types/domain";

export type ComicStripWriteInput = {
  id?: string;
  title: string;
  imageUrl: string;
  published?: boolean;
  sortOrder?: number;
};

type WriteOk<T> = { ok: true; data: T };
export type WriteResult<T> = WriteOk<T> | ApiFailure;

function isPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === code
  );
}

function toComicStripDTO(row: {
  id: string;
  title: string;
  imageUrl: string;
  published: boolean;
  sortOrder: number;
}): ComicStripDTO {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.imageUrl,
    published: row.published,
    sortOrder: row.sortOrder,
  };
}

export async function saveComicStrip(
  input: ComicStripWriteInput
): Promise<WriteResult<ComicStripDTO>> {
  const imageUrl = input.imageUrl.trim();
  if (!imageUrl) {
    return fail(400, "VALIDATION", "4コマ1枚の画像が必要です", "imageUrl に公開URLを入れてね");
  }

  const data = {
    title: input.title,
    imageUrl,
    published: input.published ?? true,
    sortOrder: input.sortOrder ?? 0,
  };

  try {
    const row = input.id
      ? await prisma.comicStrip.update({ where: { id: input.id }, data })
      : await prisma.comicStrip.create({ data });
    return { ok: true, data: toComicStripDTO(row) };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) {
      return fail(404, "NOT_FOUND", "その4コマは無いよ");
    }
    console.error("saveComicStrip failed", error);
    return fail(500, "INTERNAL", "保存に失敗しました");
  }
}

export async function removeComicStrip(
  id: string
): Promise<WriteResult<{ id: string }>> {
  try {
    await prisma.comicStrip.delete({ where: { id } });
    return { ok: true, data: { id } };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) {
      return fail(404, "NOT_FOUND", "その4コマは無いよ");
    }
    console.error("removeComicStrip failed", error);
    return fail(500, "INTERNAL", "削除に失敗しました");
  }
}
