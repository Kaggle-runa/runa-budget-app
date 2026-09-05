import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { fail, type ApiFailure } from "@/lib/api/http";
import { parseProjectLinks } from "@/lib/project-links";
import type { ProjectDTO, ProjectLink } from "@/types/domain";

export type ProjectWriteInput = {
  id?: string;
  title: string;
  status: ProjectStatus;
  masterNote?: string | null;
  overview?: string | null;
  links?: ProjectLink[] | unknown;
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

function toProjectDTO(row: {
  id: string;
  title: string;
  status: string;
  masterNote: string | null;
  overview: string | null;
  links: unknown;
}): ProjectDTO {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    masterNote: row.masterNote ?? null,
    overview: row.overview ?? null,
    links: parseProjectLinks(row.links),
  };
}

export async function saveProject(
  input: ProjectWriteInput
): Promise<WriteResult<ProjectDTO>> {
  if (!(input.status in PROJECT_STATUSES)) {
    return fail(
      400,
      "VALIDATION",
      "ステータスが不正です",
      `status は ${Object.keys(PROJECT_STATUSES).join(", ")} のいずれかだよ`
    );
  }

  const data = {
    title: input.title,
    status: input.status,
    masterNote: input.masterNote?.trim() || null,
    overview: input.overview?.trim() || null,
    links: parseProjectLinks(input.links),
  };

  try {
    const row = input.id
      ? await prisma.project.update({ where: { id: input.id }, data })
      : await prisma.project.create({ data });
    return { ok: true, data: toProjectDTO(row) };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) {
      return fail(404, "NOT_FOUND", "その挑戦は無いよ");
    }
    console.error("saveProject failed", error);
    return fail(500, "INTERNAL", "保存に失敗しました");
  }
}

export async function removeProject(
  id: string
): Promise<WriteResult<{ id: string }>> {
  const [tx, event, idea] = await Promise.all([
    prisma.transaction.count({ where: { projectId: id } }),
    prisma.event.count({ where: { projectId: id } }),
    prisma.idea.count({ where: { projectId: id } }),
  ]);
  if (tx + event + idea > 0) {
    return fail(
      422,
      "CONFLICT",
      "明細・予定・募集案が付いている挑戦は削除できないよ",
      "紐づけを外してから消してね"
    );
  }
  try {
    await prisma.project.delete({ where: { id } });
    return { ok: true, data: { id } };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) {
      return fail(404, "NOT_FOUND", "その挑戦は無いよ");
    }
    console.error("removeProject failed", error);
    return fail(500, "INTERNAL", "削除に失敗しました");
  }
}
