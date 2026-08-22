import Link from "next/link";
import { Moon, Star } from "lucide-react";
import { announcementCategoryLabel } from "@/lib/categories";
import { formatDateDot } from "@/lib/format";
import type { AnnouncementDTO } from "@/types/domain";

export function NewsCard({ item }: { item: AnnouncementDTO }) {
  const date = formatDateDot(new Date(item.publishedAt));

  return (
    <Link
      href={`/news/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white/90 shadow-[0_16px_40px_-28px_rgba(14,116,144,0.45)] ring-1 ring-sky-200/70 transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-sky-200 via-cyan-100 to-slate-100">
        {item.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.coverUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex items-start justify-between text-sky-600/70">
              <Moon className="h-7 w-7" />
              <Star className="h-4 w-4 fill-amber-200 text-amber-400" />
            </div>
            <span className="w-fit rounded-full bg-white/85 px-3 py-1 text-xs text-sky-700">
              {announcementCategoryLabel(item.category)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 py-4">
        <h3 className="text-base font-bold leading-snug text-zinc-900">
          {item.title}
        </h3>
        <div className="mt-3 flex items-center justify-between text-sm text-zinc-500">
          <span>{announcementCategoryLabel(item.category)}</span>
          <span className="tabular-nums">{date}</span>
        </div>
      </div>
    </Link>
  );
}
