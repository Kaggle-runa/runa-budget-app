import type { SocialLinkId } from "@/lib/constants";

function IconFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${className ?? "bg-zinc-100"}`}
    >
      {children}
    </span>
  );
}

export function SocialIcon({ id }: { id: SocialLinkId }) {
  if (id === "youtube") {
    return (
      <IconFrame className="bg-[#ff0000]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="#fff"
            d="M23.5 6.2a3.1 3.1 0 0 0-2.2-2.2C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.3.5A3.1 3.1 0 0 0 .5 6.2 32 32 0 0 0 0 12a32 32 0 0 0 .5 5.8 3.1 3.1 0 0 0 2.2 2.2c1.9.5 9.3.5 9.3.5s7.4 0 9.3-.5a3.1 3.1 0 0 0 2.2-2.2A32 32 0 0 0 24 12a32 32 0 0 0-.5-5.8ZM9.8 15.6V8.4L16 12l-6.2 3.6Z"
          />
        </svg>
      </IconFrame>
    );
  }

  if (id === "x") {
    return (
      <IconFrame className="bg-zinc-900">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
          <path
            fill="#fff"
            d="M14.6 10.3 22.2 2h-1.8l-6.6 7.2L8.5 2H2.2l8 11.3L2.2 22h1.8l7-7.6L15.5 22h6.3l-7.2-11.7Zm-2.5 2.7-.8-1.1-6.4-8.5h2.8l5.2 6.9.8 1.1 6.7 9h-2.8l-5.5-7.4Z"
          />
        </svg>
      </IconFrame>
    );
  }

  if (id === "note") {
    return (
      <IconFrame className="bg-[#41c9b4]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="#fff"
            d="M6.4 5.2h4.2c2.9 0 4.6 1.6 4.6 4.1 0 1.8-1 3.2-2.6 3.8l3.1 5.7h-2.5l-2.8-5.2H8.4V18.8H6.4V5.2Zm2 6.6h1.8c1.5 0 2.5-.8 2.5-2.3s-1-2.3-2.5-2.3H8.4v4.6Z"
          />
        </svg>
      </IconFrame>
    );
  }

  if (id === "qiita") {
    return (
      <IconFrame className="bg-[#55c500]">
        <span className="font-display text-[11px] leading-none text-white">Q</span>
      </IconFrame>
    );
  }

  if (id === "zenn") {
    return (
      <IconFrame className="bg-[#3ea8ff]">
        <span className="font-display text-[11px] leading-none text-white">Z</span>
      </IconFrame>
    );
  }

  return (
    <IconFrame className="bg-zinc-900">
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path
          fill="#fff"
          d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.2-4.6-5.1 0-1.1.4-2 1-2.8-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5.1 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.7.8 1 1.7 1 2.8 0 3.9-2.4 4.8-4.6 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2Z"
        />
      </svg>
    </IconFrame>
  );
}
