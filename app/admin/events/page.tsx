import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { DeleteButton } from "@/components/admin/delete-button";
import { EventForm } from "@/components/admin/event-form";
import { GlassCard } from "@/components/layout/glass-card";
import { eventKindLabel } from "@/lib/categories";
import { formatDateDot } from "@/lib/format";
import { deleteEventAction } from "@/lib/actions/events";
import { listAnnouncements, listEvents, listProjects } from "@/lib/queries";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const [events, projects, announcements] = await Promise.all([
    listEvents(),
    listProjects(),
    listAnnouncements(),
  ]);
  const editing = events.find((event) => event.id === id);

  return (
    <>
      <AdminNav currentPath="/admin/events" />
      <h1 className="mb-4 text-2xl font-bold text-secondary">予定の登録</h1>
      <GlassCard className="mb-6 p-5">
        {editing ? (
          <p className="mb-3 text-sm">
            編集中: {editing.title}{" "}
            <Link href="/admin/events" className="text-secondary underline">
              新規に戻る
            </Link>
          </p>
        ) : null}
        <EventForm
          projects={projects}
          announcements={announcements}
          initial={editing}
        />
      </GlassCard>
      <GlassCard className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-sky-50/80 text-left">
            <tr>
              <th className="px-4 py-3">開始</th>
              <th className="px-4 py-3">タイトル</th>
              <th className="px-4 py-3">種別</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-pink-100">
                <td className="px-4 py-3">
                  {formatDateDot(new Date(event.startAt))}
                  {event.allDay ? " 終日" : ""}
                </td>
                <td className="px-4 py-3">{event.title}</td>
                <td className="px-4 py-3">{eventKindLabel(event.kind)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/events?id=${event.id}`}
                      className="text-secondary underline"
                    >
                      編集
                    </Link>
                    <DeleteButton action={deleteEventAction} id={event.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </>
  );
}
