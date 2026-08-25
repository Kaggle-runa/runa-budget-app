export function NumeraiComment({ line }: { line: string }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white/80 px-5 py-5">
      <p className="text-sm font-semibold text-secondary">ルナのひとこと</p>
      <p className="mt-2 text-lg leading-relaxed text-zinc-800">「{line}」</p>
    </div>
  );
}
