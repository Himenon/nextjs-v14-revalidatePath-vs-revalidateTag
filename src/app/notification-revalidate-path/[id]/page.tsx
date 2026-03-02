import "server-only";

// revalidatePath を使うアプローチの比較用実装。
// revalidateTag アプローチとの違い:
//   - このページが通知データを表示する全ページの URL を知っている必要がある
//   - "/embed/notification" が追加・削除されると、このファイルも必ず修正が必要になる
//   - データ層（notifications-revalidate-path.ts）はキャッシュ無効化を担当しない

import { getNotificationById, markAsRead } from "../../../lib/notifications-revalidate-path";
import { NotificationDetail } from "../../../components/NotificationDetail";
import { BackToListButton } from "../../../components/BackToListButton";
import { BackToTopLink } from "../../../components/BackToTopLink";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { mainStyle } from "../../../styles/common";

type Props = {
  params: { id: string };
};

export default function NotificationDetailPage({ params }: Props) {
  const notification = getNotificationById(params.id);

  if (!notification) {
    notFound();
  }

  if (!notification.isRead) {
    markAsRead(params.id);
    // このページが通知データを表示する全ページの URL を列挙する。
    // 新しいページが追加されるたびにここへの追記が必要になる。
    revalidatePath("/notification");
    revalidatePath("/notification-revalidate-path");
    revalidatePath("/embed/notification");
  }

  const updatedNotification = { ...notification, isRead: true };

  return (
    <main style={mainStyle}>
      <BackToTopLink />
      <BackToListButton />
      <NotificationDetail notification={updatedNotification} />
    </main>
  );
}
