import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { ComicForm } from "@/components/admin/comic-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { GlassCard } from "@/components/layout/glass-card";
import { deleteComicStripAction } from "@/lib/actions/comics";
import { listComicStrips } from "@/lib/queries";

export default async function AdminYonkomaPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const items = await listComicStrips();
  const editing = items.find((item) => item.id === id);

  return (
    <>
      <AdminNav currentPath="/admin/yonkoma" />
      <h1 className="mb-4 text-2xl font-bold text-secondary">4コマの登録</h1>
      <GlassCard className="mb-6 p-5">
        {editing ? (
          <p className="mb-3 text-sm">
            編集中: {editing.title}{" "}
            <Link href="/admin/yonkoma" className="text-secondary underline">
              新規に戻る
            </Link>
          </p>
        ) : null}
        <ComicForm initial={editing} />
      </GlassCard>
      <GlassCard className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-sky-50/80 text-left">
            <tr>
              <th className="px-4 py-3">並び</th>
              <th className="px-4 py-3">プレビュー</th>
              <th className="px-4 py-3">タイトル</th>
              <th className="px-4 py-3">公開</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  まだ作品がありません。上のフォームから追加してください。
                </td>
              </tr>
            ) : null}
            {items.map((item) => (
              <tr key={item.id} className="border-t border-pink-100">
                <td className="px-4 py-3">{item.sortOrder}</td>
                <td className="px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-16 w-12 rounded object-cover object-top"
                  />
                </td>
                <td className="px-4 py-3">{item.title}</td>
                <td className="px-4 py-3">{item.published ? "公開" : "下書き"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/yonkoma?id=${item.id}`}
                      className="text-secondary underline"
                    >
                      編集
                    </Link>
                    <DeleteButton action={deleteComicStripAction} id={item.id} />
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
