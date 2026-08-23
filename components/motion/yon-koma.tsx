import { YonkomaGallery } from "@/components/comics/yonkoma-gallery";
import type { ComicStripDTO } from "@/types/domain";

export function YonKoma({ strips }: { strips: ComicStripDTO[] }) {
  return <YonkomaGallery strips={strips} />;
}
