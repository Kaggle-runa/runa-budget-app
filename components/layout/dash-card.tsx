import { cn } from "@/lib/utils";

export function DashCard({
  className,
  children,
  shutter = false,
  ...props
}: React.HTMLAttributes<HTMLElement> & { shutter?: boolean }) {
  return (
    <section
      className={cn(
        "relative z-10 rounded-3xl bg-white/90 p-6 shadow-[0_16px_40px_-28px_rgba(14,116,144,0.45)] ring-1 ring-sky-200/70 sm:p-8",
        shutter && "overflow-hidden",
        className
      )}
      {...props}
    >
      {shutter ? (
        <div className="dash-shutter-bands" aria-hidden>
          <span className="dash-shutter-band" />
          <span className="dash-shutter-band" />
          <span className="dash-shutter-band" />
          <span className="dash-shutter-band" />
          <span className="dash-shutter-band" />
        </div>
      ) : null}
      {children}
    </section>
  );
}
