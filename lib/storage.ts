import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadPublicImage(
  file: File,
  folder = ""
): Promise<string> {
  const type = file.type;
  const ext = ALLOWED_TYPES[type];
  if (!ext) {
    throw new Error("JPEG / PNG / WebP / GIF のみアップロードできます");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("画像は 5MB までです");
  }

  const env = getEnv();
  const missing = [
    !env.SUPABASE_URL ? "SUPABASE_URL" : null,
    !env.SUPABASE_SERVICE_ROLE_KEY ? "SUPABASE_SERVICE_ROLE_KEY" : null,
  ].filter((name): name is string => Boolean(name));
  if (missing.length > 0) {
    throw new Error(
      `画像アップロードの設定がありません。${missing.join(" と ")} を .env に入れて、dev サーバーを再起動してください`
    );
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const prefix = folder ? `${folder.replace(/\/$/, "")}/` : "";
  const path = `${prefix}${crypto.randomUUID()}.${ext}`;
  const body = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from("announcements").upload(path, body, {
    contentType: type,
    upsert: false,
  });
  if (error) {
    console.error("uploadPublicImage failed", error);
    throw new Error("画像の保存に失敗しました");
  }

  const { data } = supabase.storage.from("announcements").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAnnouncementImage(file: File): Promise<string> {
  return uploadPublicImage(file);
}
