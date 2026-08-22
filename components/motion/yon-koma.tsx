import Image from "next/image";
import { GlassCard } from "@/components/layout/glass-card";
import type { ComicStripDTO } from "@/types/domain";

function isRemote(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

function PanelImage({ src, alt }: { src: string; alt: string }) {
  const className = "h-full w-full object-cover";
  if (isRemote(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
      className={className}
    />
  );
}

export function YonKoma({ strips }: { strips: ComicStripDTO[] }) {
  if (strips.length === 0) return null;

  return (
    <section className="space-y-10">
      <div data-reveal className="flex items-end justify-between gap-3">
        <h2 className="text-lg font-semibold text-secondary">ルナの4コマ</h2>
        <p className="text-xs text-muted-foreground">僕の日常、4コマだよ</p>
      </div>
      {strips.map((strip) => (
        <div key={strip.id}>
          <h3
            data-reveal
            className="mb-3 text-sm font-medium text-secondary"
          >
            {strip.title}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[strip.panel1Url, strip.panel2Url, strip.panel3Url, strip.panel4Url].map(
              (src, index) => (
                <div
                  key={`${strip.id}-${index}`}
                  data-reveal
                  style={{ ["--reveal-delay" as string]: `${index * 90}ms` }}
                >
                  <GlassCard className="aspect-[3/4] overflow-hidden p-0">
                    <PanelImage
                      src={src}
                      alt={`${strip.title} ${index + 1}コマ目`}
                    />
                  </GlassCard>
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
