import "server-only";

import { getNotificationById, markAsRead } from "../../../lib/notifications";
import { NotificationDetail } from "../../../components/NotificationDetail";
import { BackToListButton } from "../../../components/BackToListButton";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

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
      <BackToListButton />
      <NotificationDetail notification={updatedNotification} />
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  maxWidth: "720px",
  margin: "0 auto",
  padding: "32px 16px",
};
