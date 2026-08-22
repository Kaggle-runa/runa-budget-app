"use client";

import { useEffect } from "react";

const INTRO_EVENT = "runa:intro-done";

export function dispatchIntroDone() {
  if (typeof document === "undefined") return;
  if (document.documentElement.dataset.intro === "done") return;
  document.documentElement.dataset.intro = "done";
  window.dispatchEvent(new Event(INTRO_EVENT));
}

export function revealDelay(ms: number): React.CSSProperties {
  return { ["--reveal-delay" as string]: `${ms}ms` };
}

export function ScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let observer: IntersectionObserver | null = null;

    const revealAll = () => {
      document.querySelectorAll("[data-reveal]").forEach((node) => {
        node.classList.add("is-in");
      });
    };

    const observe = () => {
      if (reduced) {
        revealAll();
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-in");
            observer?.unobserve(entry.target);
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      document.querySelectorAll("[data-reveal]").forEach((node) => {
        observer?.observe(node);
      });
    };

    if (reduced || document.documentElement.dataset.intro === "done") {
      observe();
      return () => observer?.disconnect();
    }

    const onDone = () => observe();
    window.addEventListener(INTRO_EVENT, onDone);
    const fallback = window.setTimeout(onDone, 2800);
    return () => {
      window.removeEventListener(INTRO_EVENT, onDone);
      window.clearTimeout(fallback);
      observer?.disconnect();
    };
  }, []);

  return null;
}
