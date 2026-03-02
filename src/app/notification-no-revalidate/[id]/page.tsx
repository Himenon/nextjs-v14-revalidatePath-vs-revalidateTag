import "server-only";

// キャッシュ無効化なしのアプローチ（失敗デモ用）。
//
// 意図的な欠陥:
//   - markAsRead() を呼ぶが、revalidatePath も revalidateTag も呼ばない
//   - BackToListButtonRouter を使う: router.push() で戻るが router.refresh() を呼ばない
//     → Router Cache が古い RSC ペイロードを返すため一覧が更新されない
//
// e2e/notification-no-revalidate.spec.ts の test.fail() でこの欠陥を示す

import { getNotificationById, markAsRead } from "../../../lib/notifications-revalidate-path";
import { NotificationDetail } from "../../../components/NotificationDetail";
import { BackToListButtonRouter } from "../../../components/BackToListButtonRouter";
import { BackToTopLink } from "../../../components/BackToTopLink";
import { notFound } from "next/navigation";
import { mainStyle } from "../../../styles/common";

type Props = {
  params: { id: string };
};

export default function NotificationNoRevalidateDetailPage({ params }: Props) {
  const notification = getNotificationById(params.id);

  if (!notification) {
    notFound();
  }

  if (!notification.isRead) {
    markAsRead(params.id);
    // revalidatePath も revalidateTag も呼ばない
    // → 一覧ページの Router Cache / Full Route Cache が古いまま残る
  }

  const updatedNotification = { ...notification, isRead: true };

  return (
    <main style={mainStyle}>
      <BackToTopLink />
      <BackToListButtonRouter href="/notification-no-revalidate" />
      <NotificationDetail notification={updatedNotification} />
    </main>
  );
}
