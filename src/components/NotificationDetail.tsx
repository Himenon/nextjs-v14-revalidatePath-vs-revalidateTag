import type { Notification } from "../lib/notifications";
import { ReadStatusBadge } from "./ReadStatusBadge";

type Props = {
  notification: Notification;
};

export function NotificationDetail({ notification }: Props) {
  return (
    <article style={articleStyle}>
      <header style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <ReadStatusBadge isRead={notification.isRead} testId="detail-read-status" />
        </div>
        <h1 style={{ margin: 0, fontSize: "24px" }}>{notification.title}</h1>
      </header>
      <p style={{ lineHeight: "1.7", color: "var(--color-text-secondary)" }}>{notification.body}</p>
    </article>
  );
}

const articleStyle: React.CSSProperties = {
  padding: "24px",
  backgroundColor: "var(--color-bg)",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
};
