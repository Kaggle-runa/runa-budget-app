import { IDEA_STATUSES, type IdeaStatus } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { fail, type ApiFailure } from "@/lib/api/http";
import type { IdeaDTO } from "@/types/domain";

export type IdeaWriteInput = {
  id?: string;
  displayName: string;
  title: string;
  body: string;
  status: IdeaStatus;
  projectId?: string | null;
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

function toIdeaDTO(row: {
  id: string;
  displayName: string;
  title: string;
  body: string;
  status: string;
  projectId: string | null;
  createdAt: Date;
}): IdeaDTO {
  return {
    id: row.id,
    displayName: row.displayName,
    title: row.title,
    body: row.body,
    status: row.status,
    projectId: row.projectId,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function saveIdea(input: IdeaWriteInput): Promise<WriteResult<IdeaDTO>> {
  if (!(input.status in IDEA_STATUSES)) {
    return fail(
      400,
      "VALIDATION",
      "ステータスが不正です",
      `status は ${Object.keys(IDEA_STATUSES).join(", ")} のいずれかだよ`
    );
  }

  const data = {
    displayName: input.displayName.trim() || "匿名",
    title: input.title,
    body: input.body,
    status: input.status,
    projectId: input.projectId || null,
  };

  try {
    const row = input.id
      ? await prisma.idea.update({ where: { id: input.id }, data })
      : await prisma.idea.create({ data });
    return { ok: true, data: toIdeaDTO(row) };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) {
      return fail(404, "NOT_FOUND", "その企画は無いよ");
    }
    if (isPrismaCode(error, "P2003")) {
      return fail(
        400,
        "VALIDATION",
        "挑戦 id が不正です",
        "GET /api/v1/projects で id を確認してね。無いときは null にしてね"
      );
    }
    console.error("saveIdea failed", error);
    return fail(500, "INTERNAL", "保存に失敗しました");
  }
}

export async function removeIdea(id: string): Promise<WriteResult<{ id: string }>> {
  try {
    await prisma.idea.delete({ where: { id } });
    return { ok: true, data: { id } };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) {
      return fail(404, "NOT_FOUND", "その企画は無いよ");
    }
    console.error("removeIdea failed", error);
    return fail(500, "INTERNAL", "削除に失敗しました");
  }
}
