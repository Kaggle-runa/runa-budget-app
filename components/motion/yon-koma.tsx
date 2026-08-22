import { GlassCard } from "@/components/layout/glass-card";

const PANELS = [
  { no: "1", title: "ご飯代", body: "残高が減っていくんだぁ…", emoji: "🌙" },
  { no: "2", title: "お仕事", body: "データで何か作ってみる！", emoji: "✨" },
  { no: "3", title: "ごはん", body: "ちょっと増えたね", emoji: "🍙" },
  { no: "4", title: "企画", body: "つぎは君と考えるよ", emoji: "💌" },
];

export function YonKoma() {
  return (
    <section className="reveal reveal-5">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-semibold text-secondary">ルナの4コマ</h2>
        <p className="text-xs text-muted-foreground">僕の日常、4コマだよ</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PANELS.map((panel, index) => (
          <GlassCard
            key={panel.no}
            className="panel-flip overflow-hidden p-0"
            style={{ animationDelay: `${0.15 + index * 0.12}s` }}
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-sky-200 to-cyan-100 px-3 py-1 text-[11px] text-sky-800">
              <span>{panel.no} コマ</span>
              <span>{panel.title}</span>
            </div>
            <div className="flex min-h-32 flex-col items-center justify-center gap-2 p-4">
              <span className="text-3xl">{panel.emoji}</span>
              <p className="font-display text-sm text-secondary">{panel.body}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
