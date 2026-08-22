import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadAnnouncementImage(file: File): Promise<string> {
  const type = file.type;
  const ext = ALLOWED_TYPES[type];
  if (!ext) {
    throw new Error("JPEG / PNG / WebP / GIF のみアップロードできます");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("画像は 5MB までです");
  }

  const env = getEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "画像アップロードの設定がありません。SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を入れてください"
    );
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const path = `${crypto.randomUUID()}.${ext}`;
  const body = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from("announcements").upload(path, body, {
    contentType: type,
    upsert: false,
  });
  if (error) {
    console.error("uploadAnnouncementImage failed", error);
    throw new Error("画像の保存に失敗しました");
  }

  const { data } = supabase.storage.from("announcements").getPublicUrl(path);
  return data.publicUrl;
}
