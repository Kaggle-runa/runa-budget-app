"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SITE, TACHIE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type HeaderNavItem = {
  href: string;
  label: string;
  external?: boolean;
};

function isActive(item: HeaderNavItem, currentPath: string) {
  if (item.external) return false;
  return item.href === "/"
    ? currentPath === "/"
    : currentPath.startsWith(item.href);
}

function itemClass(active: boolean) {
  return cn(
    "flex h-12 w-56 items-center justify-center rounded-full text-base font-bold shadow-lg ring-1 transition",
    active
      ? "bg-gradient-to-r from-sky-400 to-cyan-500 text-white ring-sky-300"
      : "bg-white/95 text-zinc-800 ring-sky-100 hover:-translate-y-0.5"
  );
}

export function MobileNav({
  items,
  currentPath,
}: {
  items: HeaderNavItem[];
  currentPath: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const contact = items.find((item) => item.href.includes("contact") || item.label.includes("問い合わせ"));
  const mainItems = contact ? items.filter((item) => item !== contact) : items;

  const overlay =
    mounted && open
      ? createPortal(
          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-label="メニュー"
            className="mobile-nav-overlay fixed inset-0 z-[60] md:hidden"
          >
            <div className="mobile-nav-orbs" aria-hidden />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-800 shadow-lg ring-1 ring-sky-100"
              aria-label="メニューを閉じる"
            >
              <X className="h-6 w-6" />
            </button>
            <nav className="flex min-h-full flex-col items-center justify-center gap-3 overflow-y-auto px-6 pb-40 pt-20">
              {mainItems.map((item, index) => {
                const active = isActive(item, currentPath);
                const className = itemClass(active);
                const style = { ["--nav-delay" as string]: `${80 + index * 50}ms` };
                if (item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className={cn("mobile-nav-item", className)}
                      style={style}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn("mobile-nav-item", className)}
                    style={style}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            {contact ? (
              <div className="mobile-nav-item pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center">
                <Image
                  src={TACHIE.joy.src}
                  alt=""
                  width={TACHIE.joy.width}
                  height={TACHIE.joy.height}
                  className="pointer-events-none mb-[-8px] h-24 w-auto object-contain"
                />
                {contact.external ? (
                  <a
                    href={contact.href}
                    target="_blank"
                    rel="noreferrer"
                    className="pointer-events-auto flex h-12 w-56 items-center justify-center rounded-full bg-gradient-to-r from-sky-300 via-white to-pink-200 text-sm font-bold text-secondary shadow-lg ring-1 ring-sky-200"
                    onClick={() => setOpen(false)}
                  >
                    {contact.label}
                  </a>
                ) : (
                  <Link
                    href={contact.href}
                    className="pointer-events-auto flex h-12 w-56 items-center justify-center rounded-full bg-gradient-to-r from-sky-300 via-white to-pink-200 text-sm font-bold text-secondary shadow-lg ring-1 ring-sky-200"
                    onClick={() => setOpen(false)}
                  >
                    {contact.label}
                  </Link>
                )}
              </div>
            ) : null}
          </div>,
          document.body
        )
      : null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={`${SITE.name}のメニュー`}
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-zinc-800 shadow-md ring-1 ring-sky-100"
      >
        <Menu className="h-6 w-6" />
      </button>
      {overlay}
    </div>
  );
}
