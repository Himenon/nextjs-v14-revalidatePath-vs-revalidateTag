import "server-only";

import { getAllNotifications } from "../../lib/notifications";
import { Notifications } from "../../components/Notifications";

export default function NotificationPage() {
  const notifications = getAllNotifications();

  return (
    <main style={mainStyle}>
      <h1 style={{ marginBottom: "24px" }}>通知一覧</h1>
      <Notifications notifications={notifications} />
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  maxWidth: "720px",
  margin: "0 auto",
  padding: "32px 16px",
};
