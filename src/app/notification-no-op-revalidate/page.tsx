import "server-only";

// revalidateTag / revalidatePath が no-op になるシナリオのデモ一覧ページ。
//
// キャッシュ構成:
//   - force-dynamic により Full Route Cache は生成されない
//   - getAllNotifications() は unstable_cache / fetch + next.tags を使わず
//     fs.readFileSync を直接呼ぶため Data Cache エントリも存在しない
//   - 詳細ページで revalidateTag / revalidatePath を呼んでも無効化する対象がないため no-op になる
//
// 既読状態が反映されない理由:
//   - RefreshOnBack を置かない: ブラウザバック時に bfcache が復元され古い状態が表示される
//   - BackToListButtonRouter は router.push() のみ: Router Cache がそのまま残る
//   - revalidateTag / revalidatePath が no-op のためサーバー側キャッシュも更新されない
//   - 結果: 一覧ページの既読状態が反映されない

export const dynamic = "force-dynamic";

import { getAllNotifications } from "../../lib/notifications";
import { Notifications } from "../../components/Notifications";
import { BackToTopLink } from "../../components/BackToTopLink";
import { mainStyle } from "../../styles/common";

export default function NotificationNoOpRevalidatePage() {
  const notifications = getAllNotifications();

  return (
    <main style={mainStyle}>
      {/* RefreshOnBack を置かない: ブラウザバック時に bfcache が復元され古い状態が表示される */}
      <BackToTopLink />
      <h1 style={{ marginBottom: "24px" }}>
        通知一覧（revalidateTag / revalidatePath no-op デモ）
      </h1>
      <Notifications notifications={notifications} basePath="/notification-no-op-revalidate" />
    </main>
  );
}
