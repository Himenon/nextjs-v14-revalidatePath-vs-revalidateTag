import "server-only";

import { getNotificationById, markAsRead } from "../../../lib/notifications";
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
    revalidatePath("/notification");
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
