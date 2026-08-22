import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin/transactions", label: "取引" },
  { href: "/admin/events", label: "予定" },
  { href: "/admin/ideas", label: "企画" },
  { href: "/admin/announcements", label: "お知らせ" },
];

export function AdminNav({ currentPath }: { currentPath: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <nav className="flex flex-wrap gap-2">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm",
              currentPath.startsWith(item.href)
                ? "bg-gradient-to-r from-sky-400 to-cyan-500 text-white"
                : "border border-primary bg-white/70 text-secondary"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/">公開サイトへ</Link>
        </Button>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm">
            ログアウト
          </Button>
        </form>
      </div>
    </div>
  );
}
