import "server-only";

// revalidateTag / revalidatePath が no-op になるシナリオのデモ詳細ページ。
//
// キャッシュ構成:
//   - getAllNotifications() は unstable_cache / fetch + next.tags を使わず
//     fs.readFileSync を直接呼ぶため Data Cache エントリが存在しない
//   - force-dynamic により Full Route Cache も生成されない
//   - そのため revalidateTag / revalidatePath を呼んでも無効化する対象がなく no-op になる
//
// 既読状態が反映されない理由:
//   - markAsRead() で JSON ファイルを更新する
//   - revalidateTag("notifications") を呼ぶ → Data Cache にエントリがないため no-op
//   - revalidatePath("/notification-no-op-revalidate") を呼ぶ → Full Route Cache がないため no-op
//   - BackToListButtonRouter は router.push() のみ: router.refresh() を呼ばない
//   - Router Cache が古い RSC ペイロードを保持するため一覧ページが未読状態のまま表示される
//
// ⚠️ router.refresh() を呼べば Router Cache が破棄され最新状態が反映される。
//    revalidateTag / revalidatePath が no-op であっても router.refresh() が担える。

import { getNotificationById, markAsRead } from "../../../lib/notifications";
import { NotificationDetail } from "../../../components/NotificationDetail";
import { BackToListButtonRouter } from "../../../components/BackToListButtonRouter";
import { BackToTopLink } from "../../../components/BackToTopLink";
import { revalidatePath, revalidateTag } from "next/cache";
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
    markAsRead(params.id);

    // ⚠️ no-op: Data Cache に "notifications" タグのエントリが存在しないため何も無効化されない。
    // getAllNotifications() は unstable_cache でラップされていないため Data Cache に載っていない。
    revalidateTag("notifications");

    // ⚠️ no-op: force-dynamic により Full Route Cache が生成されていないため何も無効化されない。
    revalidatePath("/notification-no-op-revalidate");
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
