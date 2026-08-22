import { Moon } from "lucide-react";

export function DashSectionHeader({
  title,
  asOf,
  description,
  action,
}: {
  title: string;
  asOf?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            <Moon className="h-3.5 w-3.5" />
          </span>
          {title}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {asOf ? <p className="text-sm text-zinc-500">{asOf}</p> : null}
          {action}
        </div>
      </div>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
          {description}
        </p>
      ) : null}
    </div>
  );
}
