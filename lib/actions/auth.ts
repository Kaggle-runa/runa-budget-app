"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";

const loginSchema = z.object({
  password: z.string().min(1, "パスワードを入力してください"),
});

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  if (parsed.data.password !== getEnv().ADMIN_PASSWORD) {
    return { error: "パスワードが違います" };
  }

  await setSessionCookie();
  redirect("/admin/transactions");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}
