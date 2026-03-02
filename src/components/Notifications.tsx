import Link from "next/link";
import type { Notification } from "../lib/notifications";
import { ReadStatusBadge } from "./ReadStatusBadge";

type Props = {
  notifications: Notification[];
};

export function Notifications({ notifications }: Props) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {notifications.map((notification) => (
        <li
          key={notification.id}
          style={listItemStyle}
          data-testid={`notification-item-${notification.id}`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ReadStatusBadge
              isRead={notification.isRead}
              testId={`read-status-${notification.id}`}
            />
            <Link
              href={`/notification/${notification.id}`}
              style={linkStyle}
              data-testid={`notification-link-${notification.id}`}
            >
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
  borderBottom: "1px solid var(--color-border)",
};

const linkStyle: React.CSSProperties = {
  color: "var(--color-primary)",
  textDecoration: "none",
  fontSize: "16px",
};
