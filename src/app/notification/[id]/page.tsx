import "server-only";

import { getNotificationById, markAsRead } from "../../../lib/notifications";
import { NotificationDetail } from "../../../components/NotificationDetail";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import Link from "next/link";

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
      <Link href="/notification" style={backLinkStyle}>
        ← 通知一覧に戻る
      </Link>
      <NotificationDetail notification={updatedNotification} />
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  maxWidth: "720px",
  margin: "0 auto",
  padding: "32px 16px",
};

const backLinkStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: "24px",
  color: "#1976d2",
  textDecoration: "none",
  fontSize: "14px",
};
