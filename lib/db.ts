import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaClient as SqlitePrismaClient } from "@/lib/generated/sqlite";

const CLIENT_MARK = "db-switch-v2";
type AppPrisma = PrismaClient & { __runaMark?: string };
const globalForPrisma = globalThis as unknown as { prisma?: AppPrisma };

export function isLocalSqlite() {
  const flag = process.env.USE_LOCAL_SQLITE;
  if (flag === "true" || flag === "1") return true;
  return (process.env.DATABASE_URL ?? "").startsWith("file:");
}

export function sqliteDatabaseUrl() {
  return `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
}

function createPrisma() {
  const client = (
    isLocalSqlite()
      ? new SqlitePrismaClient({
          datasources: { db: { url: sqliteDatabaseUrl() } },
          log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
        })
      : new PrismaClient({
          log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
        })
  ) as AppPrisma;
  client.__runaMark = CLIENT_MARK + (isLocalSqlite() ? "-sqlite" : "-pg");
  return client;
}

function isCurrentClient(client: AppPrisma) {
  return (
    client.__runaMark === CLIENT_MARK + (isLocalSqlite() ? "-sqlite" : "-pg") &&
    typeof client.announcement?.findFirst === "function"
  );
}

const existing = globalForPrisma.prisma;
export const prisma =
  existing && isCurrentClient(existing) ? existing : createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
