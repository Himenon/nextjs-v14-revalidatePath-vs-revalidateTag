"use server";

// revalidatePath を使うアプローチの比較用実装。
// revalidateTag アプローチとの違い:
//   - このServer Action が通知データを表示する全ページの URL を知っている必要がある
//   - "/embed/notification" が追加・削除されると、このファイルも必ず修正が必要になる
//   - データ層（notifications-revalidate-path.ts）はキャッシュ無効化を担当しない

import { markAllAsUnread } from "../../lib/notifications-revalidate-path";
import { revalidatePath } from "next/cache";

export async function markAllNotificationsAsUnread(): Promise<void> {
  markAllAsUnread();
  // このServer Action が通知データを表示する全ページの URL を列挙する。
  // 新しいページが追加されるたびにここへの追記が必要になる。
  revalidatePath("/notification");
  revalidatePath("/embed/notification");
}
