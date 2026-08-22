"use client";

import { useEffect, useState } from "react";
import { Emblem } from "@/components/layout/emblem";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const OPEN_MS = 2200;

export function CurtainIntro() {
  const [phase, setPhase] = useState<"hold" | "open" | "gone">("hold");

  useEffect(() => {
    if (phase === "gone") {
      document.body.style.overflow = "";
    }
  }, [phase]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("gone");
      return;
    }

    document.body.style.overflow = "hidden";

    const openTimer = window.setTimeout(() => setPhase("open"), 720);
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
      role="presentation"
    >
      <div className="curtain-wipe curtain-wipe-light" />
      <div className="curtain-wipe curtain-wipe-dark" />
      <div className="curtain-center">
        <Emblem size="curtain" priority />
        <p className="mt-3 text-sm text-white/80">{SITE.catchphrase}</p>
      </div>
      <button
        type="button"
        className="curtain-skip"
        onClick={() => setPhase("gone")}
      >
        開幕をとばす
      </button>
    </div>
  );
}
