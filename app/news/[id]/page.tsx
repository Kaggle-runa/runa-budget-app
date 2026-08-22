import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { announcementCategoryLabel } from "@/lib/categories";
import { formatDateDot } from "@/lib/format";
import { getAnnouncement } from "@/lib/queries";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getAnnouncement(id, true);
  if (!item) notFound();

  return (
    <PageShell currentPath="/news">
      <p className="mb-4 text-sm">
        <Link href="/news" className="text-secondary hover:underline">
          お知らせへ戻る
        </Link>
      </p>
      <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.06]">
        {item.coverUrl ? (
          <div className="aspect-video overflow-hidden bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.coverUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="px-6 py-8 sm:px-8">
          <p className="text-sm text-zinc-500">
            {announcementCategoryLabel(item.category)}
            <span className="mx-2">·</span>
            <span className="tabular-nums">
              {formatDateDot(new Date(item.publishedAt))}
            </span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            {item.title}
          </h1>
          <p className="mt-6 whitespace-pre-wrap leading-relaxed text-zinc-700">
            {item.body}
          </p>
        </div>
      </article>
    </PageShell>
  );
}
