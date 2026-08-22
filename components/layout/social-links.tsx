import { SOCIAL_LINKS } from "@/lib/constants";
import { SocialIcon } from "@/components/layout/social-icons";
import { cn } from "@/lib/utils";

export function SocialLinkGrid({ className }: { className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6", className)}>
      {SOCIAL_LINKS.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 text-sm text-zinc-800 transition-colors hover:text-secondary"
          >
            <SocialIcon id={link.id} />
            <span>{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SocialIconRow({
  ids,
  className,
}: {
  ids?: Array<(typeof SOCIAL_LINKS)[number]["id"]>;
  className?: string;
}) {
  const links = ids
    ? SOCIAL_LINKS.filter((link) => ids.includes(link.id))
    : SOCIAL_LINKS;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.label}
          className="transition-transform hover:-translate-y-0.5"
        >
          <SocialIcon id={link.id} />
        </a>
      ))}
    </div>
  );
}
