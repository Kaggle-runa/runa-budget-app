import { Moon } from "lucide-react";
import { WiggleTitle } from "@/components/motion/wiggle-title";

export function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="reveal">
      <p className="mb-2 inline-flex items-center gap-1.5 text-xs text-sky-600">
        <Moon className="h-3.5 w-3.5" />
        公開家計簿
      </p>
      <WiggleTitle text={title} className="text-3xl font-bold sm:text-4xl" />
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
