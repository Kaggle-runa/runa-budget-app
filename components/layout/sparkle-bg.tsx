import { Moon, Star } from "lucide-react";

const FLAKES = [
  { left: "8%", delay: "0s", duration: "13s" },
  { left: "22%", delay: "3s", duration: "16s" },
  { left: "41%", delay: "1s", duration: "12s" },
  { left: "63%", delay: "5s", duration: "15s" },
  { left: "78%", delay: "2s", duration: "14s" },
  { left: "91%", delay: "7s", duration: "17s" },
];

export function SparkleBg({ children }: { children: React.ReactNode }) {
  return (
    <div className="splash-bg flex min-h-screen flex-col">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="splash-glow" />
        <div className="constellation-grid absolute inset-0 opacity-70" />
        <div
          className="float-orb left-[-40px] top-24 h-40 w-40 bg-sky-300/40"
          style={{ animation: "float-blob 11s ease-in-out infinite" }}
        />
        <div
          className="float-orb right-[-20px] top-48 h-48 w-48 bg-cyan-200/50"
          style={{ animation: "float-blob 13s ease-in-out infinite reverse" }}
        />
        <div
          className="float-orb bottom-20 left-1/3 h-32 w-32 bg-sky-200/40"
          style={{ animation: "float-blob 15s ease-in-out infinite" }}
        />
        {FLAKES.map((flake) => (
          <span
            key={flake.left}
            className="petal"
            style={{
              left: flake.left,
              animationDelay: flake.delay,
              animationDuration: flake.duration,
            }}
          />
        ))}
        <Moon className="star left-6 top-24 h-4 w-4 text-sky-400" />
        <Star className="star right-10 top-40 h-4 w-4 fill-amber-200 text-amber-300" />
        <Moon
          className="star left-1/2 top-16 h-3 w-3 text-cyan-400"
          style={{ animationDelay: "0.4s" }}
        />
        <Star className="star bottom-24 left-10 h-4 w-4 fill-sky-100 text-sky-300" />
        <Moon
          className="star bottom-16 right-16 h-4 w-4 text-sky-500"
          style={{ animationDelay: "0.8s" }}
        />
      </div>
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
