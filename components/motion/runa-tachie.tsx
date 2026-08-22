"use client";

import { useState } from "react";
import Image from "next/image";
import { TACHIE, type TachieMood } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ORDER: TachieMood[] = ["normal", "joy", "troubled"];

export function RunaTachie({ empty = false }: { empty?: boolean }) {
  const [mood, setMood] = useState<TachieMood>(empty ? "troubled" : "normal");
  const [hop, setHop] = useState(0);
  const line =
    empty && mood === "troubled" ? "帳簿がまだ空っぽだよ" : TACHIE[mood].line;

  return (
    <button
      type="button"
      onClick={() => {
        setMood((current) => ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
        setHop((value) => value + 1);
      }}
      className="group relative flex w-full flex-col items-center border-0 bg-transparent p-0 text-center"
      aria-label="ルナの表情を切り替える"
    >
      <span className="mb-3 rounded-full bg-white/80 px-3 py-1 text-xs text-secondary shadow-sm animate-float-y">
        {line}
      </span>
      <span
        key={hop}
        className={cn(
          "relative w-64 sm:w-72 lg:w-80",
          hop === 0 ? "mascot-bob" : "mascot-jump"
        )}
        style={{ aspectRatio: "768 / 843" }}
      >
        {ORDER.map((key) => (
          <Image
            key={key}
            src={TACHIE[key].src}
            alt=""
            width={TACHIE[key].width}
            height={TACHIE[key].height}
            priority
            className={cn(
              "absolute inset-0 h-full w-full object-contain transition-opacity duration-200",
              mood === key ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
      </span>
    </button>
  );
}
