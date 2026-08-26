import { endOfMonth, startOfMonth } from "date-fns";
import { prisma } from "@/lib/db";
import { toTransactionDTO } from "@/lib/finance";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/categories";
import { parseProjectLinks } from "@/lib/project-links";
import type {
  AnnouncementDTO,
  ComicStripDTO,
  EventDTO,
  IdeaDTO,
  ProjectDTO,
  TransactionDTO,
} from "@/types/domain";

function toEventDTO(row: {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  kind: string;
  body: string | null;
  linkUrl: string | null;
  projectId: string | null;
  project: { title: string } | null;
  announcementId: string | null;
  announcement: { title: string; published: boolean } | null;
}): EventDTO {
  const announcementPublished = row.announcement?.published === true;
  return {
    id: row.id,
    title: row.title,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    allDay: row.allDay,
    kind: row.kind,
    body: row.body,
    linkUrl: row.linkUrl,
    projectId: row.projectId,
    projectTitle: row.project?.title ?? null,
    announcementId: row.announcementId,
    announcementTitle: row.announcement?.title ?? null,
    announcementPublished,
  };
}

export async function listTransactions(): Promise<TransactionDTO[]> {
  const rows = await prisma.transaction.findMany({
    include: { project: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toTransactionDTO);
}

export async function getTransaction(id: string): Promise<TransactionDTO | null> {
  const row = await prisma.transaction.findUnique({
    where: { id },
    include: { project: true },
  });
  return row ? toTransactionDTO(row) : null;
}

export async function listTransactionsFiltered(options: {
  from: Date;
  to: Date;
  type?: TransactionDTO["type"];
}): Promise<TransactionDTO[]> {
  const rows = await prisma.transaction.findMany({
    where: {
      date: { gte: options.from, lte: options.to },
      ...(options.type ? { type: options.type } : {}),
    },
    include: { project: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toTransactionDTO);
}

export async function listTransactionsInRange(
  start: Date,
  end: Date
): Promise<TransactionDTO[]> {
  const rows = await prisma.transaction.findMany({
    where: { date: { gte: start, lte: end } },
    include: { project: true },
    orderBy: { date: "asc" },
  });
  return rows.map(toTransactionDTO);
}

export async function listEvents(): Promise<EventDTO[]> {
  const rows = await prisma.event.findMany({
    include: { project: true, announcement: true },
    orderBy: { startAt: "desc" },
  });
  return rows.map(toEventDTO);
}

export async function getEvent(id: string): Promise<EventDTO | null> {
  const row = await prisma.event.findUnique({
    where: { id },
    include: { project: true, announcement: true },
  });
  return row ? toEventDTO(row) : null;
}

export async function listEventsOverlapping(
  start: Date,
  end: Date
): Promise<EventDTO[]> {
  const rows = await prisma.event.findMany({
    where: {
      startAt: { lte: end },
      endAt: { gte: start },
    },
    include: { project: true, announcement: true },
    orderBy: { startAt: "asc" },
  });
  return rows.map(toEventDTO);
}

export async function listMonthBundle(year: number, month: number) {
  const monthDate = new Date(year, month - 1, 1);
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const [transactions, events] = await Promise.all([
    listTransactionsInRange(start, end),
    listEventsOverlapping(start, end),
  ]);
  return { start, end, transactions, events };
}

export async function getIdea(id: string): Promise<IdeaDTO | null> {
  const row = await prisma.idea.findUnique({ where: { id } });
  if (!row) return null;
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

export async function getProject(id: string): Promise<ProjectDTO | null> {
  const row = await prisma.project.findUnique({ where: { id } });
  if (!row) return null;
  return toProjectDTO(row);
}

export async function listIdeas(): Promise<IdeaDTO[]> {
  const rows = await prisma.idea.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    displayName: row.displayName,
    title: row.title,
    body: row.body,
    status: row.status,
    projectId: row.projectId,
    createdAt: row.createdAt.toISOString(),
  }));
}

function toAnnouncementDTO(row: {
  id: string;
  title: string;
  body: string;
  category: string;
  publishedAt: Date;
  coverUrl: string | null;
  published: boolean;
}): AnnouncementDTO {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    publishedAt: row.publishedAt.toISOString(),
    coverUrl: row.coverUrl,
    published: row.published,
  };
}

export async function listAnnouncements(options?: {
  publishedOnly?: boolean;
  category?: string;
  take?: number;
}): Promise<AnnouncementDTO[]> {
  const category =
    options?.category && options.category in ANNOUNCEMENT_CATEGORIES
      ? options.category
      : undefined;
  const rows = await prisma.announcement.findMany({
    where: {
      ...(options?.publishedOnly ? { published: true } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: options?.take,
  });
  return rows.map(toAnnouncementDTO);
}

export async function getAnnouncement(
  id: string,
  publishedOnly = false
): Promise<AnnouncementDTO | null> {
  const row = await prisma.announcement.findUnique({ where: { id } });
  if (!row) return null;
  if (publishedOnly && !row.published) return null;
  return toAnnouncementDTO(row);
}

export async function listProjects(): Promise<ProjectDTO[]> {
  const rows = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProjectDTO);
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

export async function listComicStrips(options?: {
  publishedOnly?: boolean;
}): Promise<ComicStripDTO[]> {
  const rows = await prisma.comicStrip.findMany({
    where: options?.publishedOnly ? { published: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toComicStripDTO);
}

export async function getLatestUpdatedAt(): Promise<Date | null> {
  const [tx, event, idea, announcement, comic, project] = await Promise.all([
    prisma.transaction.findFirst({ orderBy: { updatedAt: "desc" } }),
    prisma.event.findFirst({ orderBy: { updatedAt: "desc" } }),
    prisma.idea.findFirst({ orderBy: { updatedAt: "desc" } }),
    prisma.announcement.findFirst({ orderBy: { updatedAt: "desc" } }),
    prisma.comicStrip.findFirst({ orderBy: { updatedAt: "desc" } }),
    prisma.project.findFirst({ orderBy: { updatedAt: "desc" } }),
  ]);
  const dates = [
    tx?.updatedAt,
    event?.updatedAt,
    idea?.updatedAt,
    announcement?.updatedAt,
    comic?.updatedAt,
    project?.updatedAt,
  ].filter(
    (value): value is Date => Boolean(value)
  );
  if (dates.length === 0) return null;
  return dates.reduce((latest, date) => (date > latest ? date : latest));
}
