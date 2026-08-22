import { IdeaForm } from "@/components/ideas/idea-form";
import { IdeaList } from "@/components/ideas/idea-list";
import { PageHeading } from "@/components/layout/page-heading";
import { PageShell } from "@/components/layout/page-shell";
import { listIdeas } from "@/lib/queries";

export default async function IdeasPage() {
  const ideas = await listIdeas();

  return (
    <PageShell currentPath="/ideas">
      <div className="mb-6">
      <PageHeading
        title="企画募集"
        description="君の案、待ってるよ。採用したらカレンダーと取引明細に載せるね。"
      />
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] reveal reveal-2">
        <IdeaForm />
        <IdeaList ideas={ideas} />
      </div>
    </PageShell>
  );
}
