import { SITE } from "@/lib/constants";

const ITEMS = [
  SITE.tagline,
  SITE.catchphrase,
  SITE.motto,
  "君の企画、待ってるよ",
  "ご飯代は自分で集めるよ",
];

export function TickerBar() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div
      data-reveal
      style={{ ["--reveal-delay" as string]: "70ms" }}
      className="relative z-10 overflow-hidden border-y border-primary/30 bg-white/50 py-2"
    >
      <div className="ticker-track gap-8 px-4 font-display text-sm text-secondary">
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="shrink-0">
            ✦ {item}
          </span>
        ))}
      </div>
    </div>
  );
}
