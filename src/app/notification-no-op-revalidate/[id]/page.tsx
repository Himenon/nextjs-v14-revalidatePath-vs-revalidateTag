import "server-only";

// revalidateTag が実質 no-op になるシナリオのデモ詳細ページ。
//
// キャッシュ構成:
//   - markAsRead() 内で revalidateTag(NOTIFICATIONS_CACHE_TAG) が呼ばれるが、
//     Data Cache / Full Route Cache にエントリが存在しないため無効化対象がなく no-op になる
//
// 既読状態が反映されない理由:
//   - markAsRead() で JSON ファイルを更新する
//   - BackToListButtonRouter は router.push() のみを呼ぶ
//   - router.refresh() を呼ばないため Router Cache がそのまま残る
//   - 一覧ページは古い RSC ペイロード（未読状態）を返すため既読状態が反映されない
//
// ⚠️ router.refresh() を呼べば Router Cache が破棄されサーバーへ再リクエストが発生するため
//    既読状態が反映される。revalidateTag が no-op であっても router.refresh() が担える。

import { getNotificationById, markAsRead } from "../../../lib/notifications";
import { NotificationDetail } from "../../../components/NotificationDetail";
import { BackToListButtonRouter } from "../../../components/BackToListButtonRouter";
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
    // router.refresh() も呼ばないため、一覧ページの Router Cache は古いまま残る。
    markAsRead(params.id);
  }

  const updatedNotification = { ...notification, isRead: true };

  return (
    <main style={mainStyle}>
      <BackToTopLink />
      {/* router.push() のみで戻る。router.refresh() を意図的に呼ばない。
          → Router Cache が古い RSC ペイロードを返すため一覧が未読のままになる */}
      <BackToListButtonRouter href="/notification-no-op-revalidate" />
      <NotificationDetail notification={updatedNotification} />
    </main>
  );
}
