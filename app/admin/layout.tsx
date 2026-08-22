import { SparkleBg } from "@/components/layout/sparkle-bg";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SparkleBg>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
    </SparkleBg>
  );
}
