import "server-only";

export const dynamic = "force-dynamic";

import { getAllNotifications } from "../../lib/notifications";
import { Notifications } from "../../components/Notifications";
import { RefreshOnBack } from "../../components/RefreshOnBack";
import { BackToTopLink } from "../../components/BackToTopLink";
import { markAllNotificationsAsUnread } from "../actions/markAllAsUnread";

export default function NotificationPage() {
  const notifications = getAllNotifications();

  return (
    <main style={mainStyle}>
      <RefreshOnBack />
      <BackToTopLink />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ margin: 0 }}>通知一覧</h1>
        <form action={markAllNotificationsAsUnread}>
          <button type="submit" style={buttonStyle} data-testid="mark-all-unread-button">
            一括未読にする
          </button>
        </form>
      </div>
      <Notifications notifications={notifications} />
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "6px 14px",
  border: "1px solid #1976d2",
  borderRadius: "4px",
  backgroundColor: "#fff",
  color: "#1976d2",
  fontSize: "14px",
  cursor: "pointer",
};

const mainStyle: React.CSSProperties = {
  maxWidth: "720px",
  margin: "0 auto",
  padding: "32px 16px",
};
