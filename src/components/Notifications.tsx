import Link from "next/link";
import type { Notification } from "../lib/notifications";

type Props = {
  notifications: Notification[];
};

export function Notifications({ notifications }: Props) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {notifications.map((notification) => (
        <li key={notification.id} style={listItemStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                ...badgeStyle,
                backgroundColor: notification.isRead ? "#e0e0e0" : "#1976d2",
                color: notification.isRead ? "#555" : "#fff",
              }}
            >
              {notification.isRead ? "既読" : "未読"}
            </span>
            <Link href={`/notification/${notification.id}`} style={linkStyle}>
              {notification.title}
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

const listItemStyle: React.CSSProperties = {
  padding: "16px",
  borderBottom: "1px solid #e0e0e0",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

const linkStyle: React.CSSProperties = {
  color: "#1976d2",
  textDecoration: "none",
  fontSize: "16px",
};
