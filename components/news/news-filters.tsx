import Link from "next/link";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function NewsFilters({ current }: { current?: string }) {
  const items = [
    { key: "", label: "すべて" },
    ...Object.entries(ANNOUNCEMENT_CATEGORIES).map(([key, label]) => ({
      key,
      label,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = (current ?? "") === item.key;
        return (
          <Link
            key={item.key || "all"}
            href={item.key ? `/news?category=${item.key}` : "/news"}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition",
              active
                ? "bg-gradient-to-r from-sky-400 to-cyan-500 text-white"
                : "bg-sky-50 text-sky-800 hover:bg-sky-100"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
