import { GlassCard } from "@/components/layout/glass-card";
import { PROJECT_LINK_KINDS, youtubeVideoId } from "@/lib/project-links";
import type { ProjectLink } from "@/types/domain";

export function ChallengeLinks({ links }: { links: ProjectLink[] }) {
  if (links.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        まだ note や YouTube のリンクは無いよ。
      </p>
    );
  }

  const youtube = links.filter((link) => youtubeVideoId(link.url));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm font-medium text-secondary shadow-sm ring-1 ring-sky-200 hover:bg-sky-50"
          >
            {link.label || PROJECT_LINK_KINDS[link.kind]}
          </a>
        ))}
      </div>
      {youtube.map((link) => {
        const videoId = youtubeVideoId(link.url);
        if (!videoId) return null;
        return (
          <div
            key={`embed-${link.url}`}
            className="overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-sky-100"
          >
            <div className="aspect-video">
              <iframe
                title={link.label}
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ChallengeOverview({
  overview,
  links,
}: {
  overview: string | null;
  links: ProjectLink[];
}) {
  return (
    <GlassCard className="mt-4 p-5">
      <div>
        <h2 className="text-lg font-semibold text-secondary">企画の概要</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
          {overview || "まだ概要は書いてないよ。"}
        </p>
      </div>
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-secondary">note / YouTube</h3>
        <p className="mt-1 mb-3 text-xs text-muted-foreground">
          作り方や裏側は、こっちを見てね。
        </p>
        <ChallengeLinks links={links} />
      </div>
    </GlassCard>
  );
}
