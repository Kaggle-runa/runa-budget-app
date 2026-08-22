import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { GlassCard } from "@/components/layout/glass-card";
import { announcementCategoryLabel } from "@/lib/categories";
import { formatDateDot } from "@/lib/format";
import { deleteAnnouncementAction } from "@/lib/actions/announcements";
import { listAnnouncements } from "@/lib/queries";

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const items = await listAnnouncements();
  const editing = items.find((item) => item.id === id);

  return (
    <>
      <AdminNav currentPath="/admin/announcements" />
      <h1 className="mb-4 text-2xl font-bold text-secondary">お知らせの登録</h1>
      <GlassCard className="mb-6 p-5">
        {editing ? (
          <p className="mb-3 text-sm">
            編集中: {editing.title}{" "}
            <Link href="/admin/announcements" className="text-secondary underline">
              新規に戻る
            </Link>
          </p>
        ) : null}
        <AnnouncementForm initial={editing} />
      </GlassCard>
      <GlassCard className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-sky-50/80 text-left">
            <tr>
              <th className="px-4 py-3">日付</th>
              <th className="px-4 py-3">画像</th>
              <th className="px-4 py-3">タイトル</th>
              <th className="px-4 py-3">区分</th>
              <th className="px-4 py-3">公開</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-pink-100">
                <td className="px-4 py-3">
                  {formatDateDot(new Date(item.publishedAt))}
                </td>
                <td className="px-4 py-3">
                  {item.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.coverUrl}
                      alt=""
                      className="h-10 w-16 rounded-md object-cover"
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">{item.title}</td>
                <td className="px-4 py-3">
                  {announcementCategoryLabel(item.category)}
                </td>
                <td className="px-4 py-3">{item.published ? "公開" : "下書き"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/announcements?id=${item.id}`}
                      className="text-secondary underline"
                    >
                      編集
                    </Link>
                    <DeleteButton action={deleteAnnouncementAction} id={item.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </>
  );
}
