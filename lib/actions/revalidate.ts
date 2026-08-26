import { revalidatePath } from "next/cache";

export function revalidatePublic(): void {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/numerai");
  revalidatePath("/calendar");
  revalidatePath("/ledger");
  revalidatePath("/ideas");
  revalidatePath("/ideas", "layout");
  revalidatePath("/news");
  revalidatePath("/contact");
  revalidatePath("/admin");
  revalidatePath("/admin/transactions");
  revalidatePath("/admin/events");
  revalidatePath("/admin/ideas");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/announcements");
  revalidatePath("/admin/yonkoma");
  revalidatePath("/admin/numerai");
}
