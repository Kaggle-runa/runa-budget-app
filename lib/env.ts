import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  ADMIN_PASSWORD: z.string().min(1),
  ADMIN_SECRET: z.string().min(8),
  GOOGLE_FORM_URL: z.union([z.string().url(), z.literal("")]).optional(),
  SUPABASE_URL: z.union([z.string().url(), z.literal("")]).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  USE_LOCAL_SQLITE: z.string().optional(),
  NUMERAI_PUBLIC_ID: z.string().optional(),
  NUMERAI_SECRET_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;

  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
    GOOGLE_FORM_URL: process.env.GOOGLE_FORM_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    USE_LOCAL_SQLITE: process.env.USE_LOCAL_SQLITE,
    NUMERAI_PUBLIC_ID: process.env.NUMERAI_PUBLIC_ID,
    NUMERAI_SECRET_KEY: process.env.NUMERAI_SECRET_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    throw new Error(
      `環境変数が不正です: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ")}`
    );
  }

  cached = parsed.data;
  return cached;
}

export function getGoogleFormUrl(): string | undefined {
  const url = getEnv().GOOGLE_FORM_URL;
  return url ? url : undefined;
}

/** Numerai 読み取り用。提出用キーは置かない。 */
export function getNumeraiApiToken(): string | undefined {
  const id = getEnv().NUMERAI_PUBLIC_ID?.trim();
  const secret = getEnv().NUMERAI_SECRET_KEY?.trim();
  if (!id || !secret) return undefined;
  return `${id}$${secret}`;
}
