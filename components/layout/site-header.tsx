import Link from "next/link";
import { SocialIconRow } from "@/components/layout/social-links";
import { Emblem } from "@/components/layout/emblem";
import { Wordmark } from "@/components/layout/wordmark";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader({
  currentPath,
  contactHref,
}: {
  currentPath: string;
  contactHref?: string;
}) {
  const items = [
    ...NAV_ITEMS,
    {
      href: contactHref ?? "/contact",
      label: "問い合わせ",
      external: Boolean(contactHref),
    },
  ];

  return (
    <header
      data-reveal
      className="sticky top-0 z-30 border-b border-sky-200/80 bg-white/70 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform hover:scale-105"
          aria-label="紹介へ"
        >
          <Emblem size="header" priority />
          <Wordmark size="header" priority />
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {items.map((item) => {
            const active =
              !("external" in item && item.external) &&
              (item.href === "/"
                ? currentPath === "/"
                : currentPath.startsWith(item.href));
            const className = cn(
              "rounded-full px-3 py-1.5 transition-transform duration-200 hover:-translate-y-0.5",
              active
                ? "bg-gradient-to-r from-sky-400 to-cyan-500 text-white"
                : "text-secondary hover:bg-sky-50"
            );
            if ("external" in item && item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={className}
                >
                  {item.label}
                </a>
              );
            }
            return (
              <Link key={item.href} href={item.href} className={className}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <SocialIconRow ids={["youtube", "x", "github"]} />
      </div>
    </header>
  );
}
