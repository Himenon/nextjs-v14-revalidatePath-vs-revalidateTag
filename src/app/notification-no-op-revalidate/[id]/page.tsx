import "server-only";

// revalidateTag が実質 no-op になるシナリオのデモ詳細ページ。
//
// キャッシュ構成:
//   - markAsRead() 内で revalidateTag(NOTIFICATIONS_CACHE_TAG) が呼ばれるが、
//     Data Cache / Full Route Cache にエントリが存在しないため無効化対象がなく no-op になる
//
// 既読状態の更新フロー:
//   - markAsRead() で JSON ファイルを更新する
//   - BackToListButtonRefresh が router.push("/notification-no-op-revalidate") を呼ぶ
//   - 続けて router.refresh() を呼ぶことでクライアント側 Router Cache を破棄する
//   - サーバーへの再リクエストが発生し、一覧ページが最新の既読状態で再レンダリングされる
//   - revalidateTag が no-op であっても、router.refresh() が既読状態の反映を担う

import { getNotificationById, markAsRead } from "../../../lib/notifications";
import { NotificationDetail } from "../../../components/NotificationDetail";
import { BackToListButtonRefresh } from "../../../components/BackToListButtonRefresh";
import { BackToTopLink } from "../../../components/BackToTopLink";
import { notFound } from "next/navigation";
import { mainStyle } from "../../../styles/common";

type Props = {
  params: { id: string };
};

export default function NotificationNoOpRevalidateDetailPage({ params }: Props) {
  const notification = getNotificationById(params.id);

  if (!notification) {
    notFound();
  }

  if (!notification.isRead) {
    // revalidateTag(NOTIFICATIONS_CACHE_TAG) は markAsRead() 内で呼ばれるが、
    // Data Cache に通知一覧のエントリが存在しないため no-op になる。
    // 既読状態の反映は呼び出し元の router.refresh() が担っている。
    markAsRead(params.id);
  }

  const updatedNotification = { ...notification, isRead: true };

  return (
    <main style={mainStyle}>
      <BackToTopLink />
      <BackToListButtonRefresh href="/notification-no-op-revalidate" />
      <NotificationDetail notification={updatedNotification} />
    </main>
  );
}
