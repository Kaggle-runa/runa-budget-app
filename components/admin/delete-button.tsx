"use client";

import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  id,
  label = "削除",
}: {
  action: (id: string) => Promise<void>;
  id: string;
  label?: string;
}) {
  return (
    <form
      action={async () => {
        if (window.confirm("削除してよいですか？")) {
          await action(id);
        }
      }}
    >
      <Button type="submit" variant="ghost" size="sm">
        {label}
      </Button>
    </form>
  );
}
