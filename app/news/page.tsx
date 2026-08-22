import { NewsCard } from "@/components/news/news-card";
import { NewsFilters } from "@/components/news/news-filters";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeading } from "@/components/layout/page-heading";
import { PageShell } from "@/components/layout/page-shell";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/categories";
import { listAnnouncements } from "@/lib/queries";

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const selected =
    category && category in ANNOUNCEMENT_CATEGORIES ? category : undefined;
  const items = await listAnnouncements({
    publishedOnly: true,
    category: selected,
  });

  return (
    <PageShell currentPath="/news">
      <div className="mb-6">
        <PageHeading
          title="お知らせ"
          description="配信やサイトの更新を、ここに載せていくよ。"
        />
      </div>
      <NewsFilters current={selected} />
      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="まだお知らせがないよ"
            description="出したら、ここに並ぶよ。"
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
