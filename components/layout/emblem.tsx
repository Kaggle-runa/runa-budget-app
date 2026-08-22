import Image from "next/image";
import { EMBLEM, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  header: "h-11 w-11",
  hero: "h-52 w-52 sm:h-60 sm:w-60",
  curtain: "h-28 w-28 sm:h-32 sm:w-32",
} as const;

export function Emblem({
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
      src={EMBLEM.src}
      alt={SITE.name}
      width={EMBLEM.width}
      height={EMBLEM.height}
      priority={priority}
      className={cn("rounded-full object-cover", SIZE_CLASS[size], className)}
    />
  );
}
