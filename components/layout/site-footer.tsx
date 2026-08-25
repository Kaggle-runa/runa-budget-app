import Link from "next/link";
import { DashCard } from "@/components/layout/dash-card";
import { SocialLinkGrid } from "@/components/layout/social-links";
import { SITE } from "@/lib/constants";

export function SiteFooter({ contactHref }: { contactHref?: string }) {
  return (
    <footer
      data-reveal
      className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 text-sm text-muted-foreground"
    >
      <DashCard className="mb-8">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900">
          {SITE.name}について
        </h2>
        <p className="mt-3 max-w-3xl whitespace-pre-line leading-relaxed text-zinc-600">
          {SITE.description}
        </p>
        <p className="mt-3 max-w-3xl whitespace-pre-line leading-relaxed text-zinc-600">
          {SITE.socialNote}
        </p>
        <SocialLinkGrid className="mt-6" />
      </DashCard>
      <p className="mb-2 max-w-3xl whitespace-pre-line">
        {"金額の単位は円だよ。ここにある数字は、取引明細から集計した速報だね。\nまちがいやすこし遅れがあるかも。迷ったら取引明細を見てほしいな。"}
      </p>
      <div className="flex flex-wrap gap-3">
        <span>
          © {new Date().getFullYear()} {SITE.name}
        </span>
        <Link href="/dashboard" className="text-secondary hover:underline">
          収支を見る
        </Link>
        {contactHref ? (
          <a
            href={contactHref}
            target="_blank"
            rel="noreferrer"
            className="text-secondary hover:underline"
          >
            問い合わせ
          </a>
        ) : (
          <Link href="/contact" className="text-secondary hover:underline">
            問い合わせ
          </Link>
        )}
        <Link href="/admin/login" className="text-secondary hover:underline">
          運営ログイン
        </Link>
      </div>
    </footer>
  );
}
