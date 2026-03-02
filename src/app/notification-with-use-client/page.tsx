// use client コンポーネントでクライアント側フェッチを行うデモ一覧ページ。
//
// キャッシュ構成:
//   - このページ自体は Server Component（静的）
//   - 通知リストは NotificationsClient（Client Component）が /api/notifications を fetch する
//   - Router Cache / Full Route Cache / Data Cache を使わない
//
// 既読状態の反映:
//   - 詳細ページで PATCH /api/notifications/[id]/mark-as-read を呼ぶ
//   - 一覧ページに戻ると visibilitychange イベントで NotificationsClient が再 fetch する
//   - router.refresh() 不要: ページ全体の RSC ペイロードを破棄せず
//     NotificationsClient の state だけが更新される

import { NotificationsClient } from "../../components/NotificationsClient";
import { BackToTopLink } from "../../components/BackToTopLink";
import { mainStyle } from "../../styles/common";

export default function NotificationWithUseClientPage() {
  return (
    <main style={mainStyle}>
      <BackToTopLink />
      <h1 style={{ marginBottom: "24px" }}>通知一覧（use client フェッチデモ）</h1>
      <NotificationsClient basePath="/notification-with-use-client" />
    </main>
  );
}
