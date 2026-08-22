import { PageHeading } from "@/components/layout/page-heading";
import { PageShell } from "@/components/layout/page-shell";
import { DashCard } from "@/components/layout/dash-card";
import { Button } from "@/components/ui/button";
import { getGoogleFormUrl } from "@/lib/env";

export default function ContactPage() {
  const formUrl = getGoogleFormUrl();

  return (
    <PageShell currentPath="/contact">
      <div className="mb-6">
        <PageHeading
          title="問い合わせ"
          description="企画の案は企画募集へ。数字やサイトの話は、Googleフォームから送ってね。"
        />
      </div>
      <div className="mx-auto max-w-xl">
        <DashCard>
          {formUrl ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-zinc-600">
                ボタンを押すと Google フォームが開くよ。届いた内容はここには出さないから、安心して書いてね。
              </p>
              <Button asChild size="lg">
                <a href={formUrl} target="_blank" rel="noreferrer">
                  Googleフォームを開く
                </a>
              </Button>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-zinc-600">
              フォームの準備中だよ。もうすこし待ってね。
            </p>
          )}
        </DashCard>
      </div>
    </PageShell>
  );
}
