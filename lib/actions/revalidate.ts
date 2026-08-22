import { revalidatePath } from "next/cache";

export function revalidatePublic(): void {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/ledger");
  revalidatePath("/ideas");
  revalidatePath("/news");
  revalidatePath("/contact");
  revalidatePath("/admin");
  revalidatePath("/admin/transactions");
  revalidatePath("/admin/events");
  revalidatePath("/admin/ideas");
  revalidatePath("/admin/announcements");
  revalidatePath("/admin/yonkoma");
}
