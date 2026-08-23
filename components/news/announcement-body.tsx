import { Fragment, type ReactNode } from "react";

const TOKEN =
  /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;

function isExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function parseInlines(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  TOKEN.lastIndex = 0;
  let match = TOKEN.exec(text);
  while (match) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={key}>{match[1]}</strong>);
    } else if (match[2] && match[3]) {
      const href = match[3];
      nodes.push(
        <a
          key={key}
          href={href}
          className="font-medium text-secondary underline underline-offset-2"
          {...(isExternal(href)
            ? { target: "_blank", rel: "noreferrer" }
            : {})}
        >
          {match[2]}
        </a>
      );
    }
    key += 1;
    last = match.index + match[0].length;
    match = TOKEN.exec(text);
  }
  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes;
}

export function AnnouncementBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-4 leading-relaxed text-zinc-700">
      {blocks.map((block, index) => (
        <p key={index}>
          {block.split("\n").map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {lineIndex > 0 ? <br /> : null}
              {parseInlines(line)}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
