import { cn } from "@/lib/utils";

export function WiggleTitle({
  text,
  className,
  as: Tag = "h1",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "p";
}) {
  return (
    <Tag className={cn("font-display title-shimmer tracking-wide", className)}>
      {Array.from(text).map((char, index) =>
        char === " " ? (
          <span key={`space-${index}`}>{"\u00A0"}</span>
        ) : (
          <span key={`${char}-${index}`} className="letter-pop-wrap">
            <span
              className="letter-pop"
              style={{ animationDelay: `${index * 55}ms` }}
            >
              {char}
            </span>
          </span>
        )
      )}
    </Tag>
  );
}
