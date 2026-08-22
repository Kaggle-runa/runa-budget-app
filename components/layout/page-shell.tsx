import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SparkleBg } from "@/components/layout/sparkle-bg";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { TickerBar } from "@/components/motion/ticker-bar";
import { getGoogleFormUrl } from "@/lib/env";

export function PageShell({
  currentPath,
  children,
}: {
  currentPath: string;
  children: React.ReactNode;
}) {
  const contactHref = getGoogleFormUrl();

  return (
    <SparkleBg>
      <ScrollReveal />
      <SiteHeader currentPath={currentPath} contactHref={contactHref} />
      <TickerBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <SiteFooter contactHref={contactHref} />
    </SparkleBg>
  );
}
