import "server-only";

export const dynamic = "force-dynamic";

import { getAllNotifications } from "../../lib/notifications";
import { Notifications } from "../../components/Notifications";
import { RefreshOnBack } from "../../components/RefreshOnBack";
import { BackToTopLink } from "../../components/BackToTopLink";
import { markAllNotificationsAsUnread } from "../actions/markAllAsUnread";
import { mainStyle } from "../../styles/common";

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
  border: "1px solid var(--color-primary)",
  borderRadius: "4px",
  backgroundColor: "var(--color-bg)",
  color: "var(--color-primary)",
  fontSize: "14px",
  cursor: "pointer",
};
