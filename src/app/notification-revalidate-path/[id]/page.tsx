import "server-only";

// revalidatePath を使うアプローチの比較用実装。
// revalidateTag アプローチとの違い:
//   - このページが通知データを表示する全ページの URL を知っている必要がある
//   - "/embed/notification" が追加・削除されると、このファイルも必ず修正が必要になる
//   - データ層（notifications-revalidate-path.ts）はキャッシュ無効化を担当しない

import { getNotificationById, markAsRead } from "../../../lib/notifications-revalidate-path";
import { NotificationDetail } from "../../../components/NotificationDetail";
import { BackToListButton } from "../../../components/BackToListButton";
import { BackToTopLink } from "../../../components/BackToTopLink";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { mainStyle } from "../../../styles/common";

type Props = {
  params: { id: string };
};

export default function NotificationDetailPage({ params }: Props) {
  const notification = getNotificationById(params.id);

  if (!notification) {
    notFound();
  }

  if (!notification.isRead) {
    // ⚠️ 関心の分離違反: ページ（UI層）がデータ層の副作用（既読への書き込み）を直接実行している。
    // データの変更責務はデータ層（notifications-revalidate-path.ts）が持つべきだが、
    // キャッシュ無効化を呼び出し側に委ねる設計のため、ここで呼ぶ以外に選択肢がない。
    markAsRead(params.id);

    // ⚠️ 関心の分離違反: 通知詳細ページが「通知データを表示する他の全ページの URL」を知っている。
    // 詳細ページは自身の表示責務だけを持つべきで、他ページの存在を知るべきではない。
    // 通知一覧ページ・埋め込みページ・revalidatePath 版一覧ページが増えるたびに
    // この詳細ページも修正が必要になる（変更理由が複数存在する = 単一責任原則の違反）。
    revalidatePath("/notification");
    // ⚠️ 関心の分離違反: revalidatePath 版の一覧ページが存在することを詳細ページが把握している。
    // このルートが追加・削除されるたびに詳細ページの修正が必要になる。
    revalidatePath("/notification-revalidate-path");
    // ⚠️ 関心の分離違反: 埋め込みページの存在を詳細ページが把握している。
    // 埋め込みページが削除・リネームされても、このコードは残り続ける可能性がある（削除漏れ）。
    revalidatePath("/embed/notification");
  }

  const updatedNotification = { ...notification, isRead: true };

  return (
    <main style={mainStyle}>
      <BackToTopLink />
      <BackToListButton />
      <NotificationDetail notification={updatedNotification} />
    </main>
  );
}
