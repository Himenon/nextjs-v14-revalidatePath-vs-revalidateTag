import "server-only";

// キャッシュ無効化なしのアプローチ（失敗デモ用）。
//
// 意図的な欠陥:
//   - force-dynamic を使わないため、本番環境では Full Route Cache に乗る
//   - RefreshOnBack を使わないため、ブラウザバック時に bfcache が復元される
//   - 一覧リンクが /notification-no-revalidate/[id] を指す
//
// その結果:
//   - 詳細ページで既読処理が実行されても、一覧ページのキャッシュが残り未読のままに見える
//   - e2e/notification-no-revalidate.spec.ts の test.fail() で失敗を示す

import { getAllNotifications } from "../../lib/notifications-revalidate-path";
import { Notifications } from "../../components/Notifications";
import { BackToTopLink } from "../../components/BackToTopLink";
import { mainStyle } from "../../styles/common";

export default function NotificationNoRevalidatePage() {
  const notifications = getAllNotifications();

  return (
    <main style={mainStyle}>
      {/* RefreshOnBack を置かない: ブラウザバック時に bfcache が復元され古い状態が表示される */}
      <BackToTopLink />
      <h1 style={{ marginBottom: "24px" }}>通知一覧（キャッシュ無効化なし）</h1>
      <Notifications notifications={notifications} basePath="/notification-no-revalidate" />
    </main>
  );
}
