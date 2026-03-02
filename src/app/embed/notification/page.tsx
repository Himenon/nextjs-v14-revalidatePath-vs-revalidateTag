import "server-only";

import { getAllNotifications } from "../../../lib/notifications";
import { Notifications } from "../../../components/Notifications";

export default function EmbedNotificationPage() {
  const notifications = getAllNotifications();

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "16px", fontSize: "18px" }}>通知一覧（埋め込み）</h2>
      <Notifications notifications={notifications} />
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  border: "2px dashed #bdbdbd",
  borderRadius: "8px",
  padding: "24px",
  maxWidth: "720px",
  margin: "32px auto",
};
