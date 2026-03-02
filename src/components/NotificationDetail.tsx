import type { Notification } from "../lib/notifications";

type Props = {
  notification: Notification;
};

export function NotificationDetail({ notification }: Props) {
  return (
    <article style={articleStyle}>
      <header style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <span
            data-testid="detail-read-status"
            style={{
              ...badgeStyle,
              backgroundColor: notification.isRead ? "#e0e0e0" : "#1976d2",
              color: notification.isRead ? "#555" : "#fff",
            }}
          >
            {notification.isRead ? "既読" : "未読"}
          </span>
        </div>
        <h1 style={{ margin: 0, fontSize: "24px" }}>{notification.title}</h1>
      </header>
      <p style={{ lineHeight: "1.7", color: "#333" }}>{notification.body}</p>
    </article>
  );
}

const articleStyle: React.CSSProperties = {
  padding: "24px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};
