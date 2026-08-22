import { GlassCard } from "@/components/layout/glass-card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <GlassCard className="px-6 py-10 text-center">
      <p className="font-medium text-secondary">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </GlassCard>
  );
}
