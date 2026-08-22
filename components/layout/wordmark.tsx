import Image from "next/image";
import { SITE, WORDMARK } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  header: "h-11 sm:h-12",
  hero: "h-[7.25rem] sm:h-36",
  curtain: "h-28 sm:h-32",
} as const;

export function Wordmark({
  size,
  className,
  priority = false,
}: {
  size: keyof typeof SIZE_CLASS;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={WORDMARK.src}
      alt={SITE.name}
      width={WORDMARK.width}
      height={WORDMARK.height}
      priority={priority}
      className={cn("w-auto max-w-full", SIZE_CLASS[size], className)}
    />
  );
}
