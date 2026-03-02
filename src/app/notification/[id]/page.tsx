import "server-only";

import { getNotificationById, markAsRead } from "../../../lib/notifications";
import { NotificationDetail } from "../../../components/NotificationDetail";
import { BackToListButton } from "../../../components/BackToListButton";
import { BackToTopLink } from "../../../components/BackToTopLink";
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
    // ✅️ ページは「既読にする」という意図だけを表明している。
    // revalidatePath のように他ページの URL を列挙する必要がなく、
    // 通知データを表示する新しいページが追加されてもこのファイルは変更不要。
    markAsRead(params.id);
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
