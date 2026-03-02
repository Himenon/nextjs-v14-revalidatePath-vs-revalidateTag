import "server-only";

// revalidateTag が実質 no-op になるシナリオのデモ一覧ページ。
//
// キャッシュ構成:
//   - force-dynamic により Full Route Cache は生成されない
//   - getAllNotifications() は unstable_cache / fetch + next.tags を使わず
//     fs.readFileSync を直接呼ぶため Data Cache エントリも存在しない
//   - そのため markAsRead() 内の revalidateTag(NOTIFICATIONS_CACHE_TAG) は
//     無効化する対象がなく実質 no-op になる
//
// 既読状態の更新フロー:
//   - 詳細ページで markAsRead() を呼ぶ → JSON ファイルを更新
//   - 詳細ページの BackToListButtonRefresh が router.push() + router.refresh() を呼ぶ
//   - router.refresh() がクライアント側 Router Cache を破棄し、
//     サーバーに再リクエストが飛んで一覧ページが最新状態で再レンダリングされる
//   - revalidateTag が no-op でも router.refresh() があれば既読状態が反映される

export const dynamic = "force-dynamic";

import { getAllNotifications } from "../../lib/notifications";
import { Notifications } from "../../components/Notifications";
import { RefreshOnBack } from "../../components/RefreshOnBack";
import { BackToTopLink } from "../../components/BackToTopLink";
import { mainStyle } from "../../styles/common";

export default function NotificationNoOpRevalidatePage() {
  const notifications = getAllNotifications();

  return (
    <main style={mainStyle}>
      <RefreshOnBack />
      <BackToTopLink />
      <h1 style={{ marginBottom: "24px" }}>通知一覧（revalidateTag no-op デモ）</h1>
      <Notifications notifications={notifications} basePath="/notification-no-op-revalidate" />
    </main>
  );
}
