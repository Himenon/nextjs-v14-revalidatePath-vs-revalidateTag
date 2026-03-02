import "server-only";

// revalidatePath を使うアプローチの比較用一覧ページ。
// revalidateTag アプローチとの違い:
//   - markAllAsUnread-revalidate-path.ts が revalidatePath("/notification-revalidate-path") を
//     明示的に呼ばないと、このページのキャッシュが無効化されない
//   - 新しいページが追加されるたびに revalidatePath の呼び出し箇所を全て修正する必要がある

export const dynamic = "force-dynamic";

import { getAllNotifications } from "../../lib/notifications-revalidate-path";
import { Notifications } from "../../components/Notifications";
import { RefreshOnBack } from "../../components/RefreshOnBack";
import { BackToTopLink } from "../../components/BackToTopLink";
import { markAllNotificationsAsUnread } from "../actions/markAllAsUnread-revalidate-path";
import { mainStyle } from "../../styles/common";

export default function NotificationRevalidatePathPage() {
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
        <h1 style={{ margin: 0 }}>通知一覧（revalidatePath）</h1>
        <form action={markAllNotificationsAsUnread}>
          <button type="submit" style={buttonStyle} data-testid="mark-all-unread-button">
            一括未読にする
          </button>
        </form>
      </div>
      <Notifications notifications={notifications} basePath="/notification-revalidate-path" />
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
