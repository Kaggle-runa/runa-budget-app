"use client";

import { useEffect, useState } from "react";
import { Emblem } from "@/components/layout/emblem";
import { dispatchIntroDone } from "@/components/motion/scroll-reveal";
import { SITE } from "@/lib/constants";
import { dayPeriod, type DayPeriod } from "@/lib/day-period";
import { cn } from "@/lib/utils";

const OPEN_MS = 2200;

const CLOUDS = [
  { left: "-4%", top: "12%", scale: 1.15, delay: "0s", duration: "18s" },
  { left: "62%", top: "8%", scale: 0.85, delay: "-4s", duration: "22s" },
  { left: "8%", top: "68%", scale: 1.35, delay: "-8s", duration: "20s" },
  { left: "72%", top: "74%", scale: 1, delay: "-2s", duration: "16s" },
  { left: "38%", top: "82%", scale: 0.7, delay: "-6s", duration: "24s" },
] as const;

const STARS = [
  { left: "14%", top: "22%" },
  { left: "28%", top: "14%" },
  { left: "71%", top: "18%" },
  { left: "84%", top: "28%" },
  { left: "18%", top: "58%" },
  { left: "88%", top: "62%" },
  { left: "46%", top: "10%" },
] as const;

function CurtainSky({ tone }: { tone: "dark" | "light" }) {
  return (
    <div className={cn("curtain-sky", `curtain-sky-${tone}`)} aria-hidden>
      <span className="curtain-moon" />
      {STARS.map((star) => (
        <span
          key={`${star.left}-${star.top}`}
          className="curtain-star"
          style={{ left: star.left, top: star.top }}
        />
      ))}
      {CLOUDS.map((cloud) => (
        <span
          key={`${cloud.left}-${cloud.top}`}
          className="curtain-cloud"
          style={{
            left: cloud.left,
            top: cloud.top,
            animationDelay: cloud.delay,
            animationDuration: cloud.duration,
            transform: `scale(${cloud.scale})`,
          }}
        />
      ))}
    </div>
  );
}

export function CurtainIntro() {
  const [phase, setPhase] = useState<"hold" | "open" | "gone">("hold");
  const [period, setPeriod] = useState<DayPeriod>("day");

  useEffect(() => {
    setPeriod(dayPeriod());
  }, []);

  useEffect(() => {
    if (phase === "gone") {
      document.body.style.overflow = "";
    }
  }, [phase]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dispatchIntroDone();
      setPhase("gone");
      return;
    }

    document.body.style.overflow = "hidden";

    const openTimer = window.setTimeout(() => {
      dispatchIntroDone();
      setPhase("open");
    }, 720);
    const goneTimer = window.setTimeout(() => setPhase("gone"), OPEN_MS);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(openTimer);
      window.clearTimeout(goneTimer);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={cn("curtain-intro", phase === "open" && "is-opening")}
      data-period={period}
      suppressHydrationWarning
      role="presentation"
    >
      <div className="curtain-wipe curtain-wipe-light">
        <CurtainSky tone="light" />
      </div>
      <div className="curtain-wipe curtain-wipe-dark">
        <CurtainSky tone="dark" />
      </div>
      <div className="curtain-center">
        <Emblem size="curtain" priority />
        <p className="mt-3 text-sm text-white/80">{SITE.catchphrase}</p>
      </div>
      <button
        type="button"
        className="curtain-skip"
        onClick={() => {
          dispatchIntroDone();
          setPhase("gone");
        }}
      >
        開幕をとばす
      </button>
    </div>
  );
}
