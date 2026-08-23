"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ComicStripDTO } from "@/types/domain";
import { cn } from "@/lib/utils";

function episodeNo(index: number, total: number) {
  return String(total - index).padStart(2, "0");
}

export function YonkomaGallery({ strips }: { strips: ComicStripDTO[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = openIndex !== null ? strips[openIndex] : null;

  useEffect(() => {
    if (openIndex === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowLeft") {
        setOpenIndex((current) =>
          current === null ? current : Math.max(0, current - 1)
        );
      }
      if (event.key === "ArrowRight") {
        setOpenIndex((current) =>
          current === null ? current : Math.min(strips.length - 1, current + 1)
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, strips.length]);

  if (strips.length === 0) return null;

  return (
    <section className="space-y-5">
      <div data-reveal className="flex items-end justify-between gap-3">
        <h2 className="text-lg font-semibold text-secondary">ルナの4コマ</h2>
        <p className="text-xs text-muted-foreground">一覧から選んで読んでね</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {strips.map((strip, index) => (
          <button
            key={strip.id}
            type="button"
            data-reveal
            style={{ ["--reveal-delay" as string]: `${(index % 4) * 70}ms` }}
            onClick={() => setOpenIndex(index)}
            className="group relative overflow-hidden rounded-2xl bg-white text-left shadow-lg ring-1 ring-sky-200/80 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            {index === 0 ? (
              <span className="absolute left-0 top-0 z-10 rounded-br-xl bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                NEW
              </span>
            ) : null}
            <p className="truncate px-3 pt-2 text-xs font-medium text-secondary">
              {strip.title}
            </p>
            <div className="relative mx-2 mt-1 aspect-[4/3] overflow-hidden rounded-xl bg-sky-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={strip.imageUrl}
                alt=""
                className="h-full w-full object-cover object-top"
              />
            </div>
            <p className="py-2 text-center text-lg font-bold tabular-nums text-zinc-800">
              {episodeNo(index, strips.length)}
            </p>
          </button>
        ))}
      </div>

      {open && openIndex !== null ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-sky-950/55 p-3 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
          onClick={() => setOpenIndex(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-sky-100 px-4 py-3">
              <h3 className="min-w-0 truncate text-sm font-bold text-secondary">
                {open.title}
              </h3>
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white"
                aria-label="閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto bg-sky-50/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={open.imageUrl}
                alt={open.title}
                className="mx-auto block h-auto w-full"
              />
            </div>
            <div className="flex items-center justify-between bg-sky-500 px-3 py-2 text-white">
              <button
                type="button"
                disabled={openIndex === 0}
                onClick={() => setOpenIndex(openIndex - 1)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  openIndex === 0 ? "opacity-40" : "hover:bg-white/15"
                )}
                aria-label="前の作品"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="text-sm font-bold tabular-nums">
                {episodeNo(openIndex, strips.length)}
              </p>
              <button
                type="button"
                disabled={openIndex === strips.length - 1}
                onClick={() => setOpenIndex(openIndex + 1)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  openIndex === strips.length - 1 ? "opacity-40" : "hover:bg-white/15"
                )}
                aria-label="次の作品"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
