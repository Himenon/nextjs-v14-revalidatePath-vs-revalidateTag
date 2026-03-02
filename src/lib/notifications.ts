import "server-only";

import fs from "fs";
import path from "path";
import { revalidateTag } from "next/cache";

// ✅️ キャッシュタグをデータ層が一元管理している。
// 呼び出し側（ページ・Server Action）はこのタグの存在を知る必要がない。
const NOTIFICATIONS_CACHE_TAG = "notifications";

export type Notification = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
};

const dataFilePath = path.join(process.cwd(), "src/data/notifications.json");

// ⚠️ 実装漏れの注意: revalidateTag が有効に機能するには、このデータ取得が
// unstable_cache でラップされており、かつ NOTIFICATIONS_CACHE_TAG と同じタグが
// 付与されている必要がある。
// 現在は fs.readFileSync を直接呼んでおり Data Cache に載っていないため、
// revalidateTag(NOTIFICATIONS_CACHE_TAG) は実質 no-op になっている。
// 一覧ページに force-dynamic が設定されているため表示上の問題は発生しないが、
// force-dynamic を外して unstable_cache を導入する場合は必ずタグを一致させること。
function readNotifications(): Notification[] {
  const raw = fs.readFileSync(dataFilePath, "utf-8");
  return JSON.parse(raw) as Notification[];
}

function writeNotifications(notifications: Notification[]): void {
  fs.writeFileSync(dataFilePath, JSON.stringify(notifications, null, 2), "utf-8");
}

export function getAllNotifications(): Notification[] {
  return readNotifications();
}

export function getNotificationById(id: string): Notification | undefined {
  return readNotifications().find((n) => n.id === id);
}

export function markAsRead(id: string): void {
  const notifications = readNotifications();
  const updated = notifications.map((n): Notification => {
    if (n.id === id) {
      return { ...n, isRead: true };
    }
    return n;
  });
  writeNotifications(updated);
  // ✅️ 書き込みとキャッシュ無効化がデータ層に閉じている。
  // 呼び出し側（ページ）は markAsRead() を呼ぶだけでよく、
  // キャッシュの存在・タグ名・無効化タイミングを一切知らなくてよい。
  // ⚠️ 実装漏れの注意: revalidateTag は Server Components・Server Actions・Route Handlers
  // からのみ呼び出せる。Client Component から呼ぶと実行時エラーになる。
  // ⚠️ 実装漏れの注意: revalidateTag は Data Cache と Full Route Cache を無効化するが、
  // ブラウザ側の Router Cache（クライアントサイドキャッシュ）は無効化しない。
  // クライアントサイドナビゲーションで最新状態を表示するには、
  // Client Component 側で router.refresh() を併用する必要がある。
  revalidateTag(NOTIFICATIONS_CACHE_TAG);
}

export function markAllAsUnread(): void {
  const notifications = readNotifications();
  const updated = notifications.map((n): Notification => ({ ...n, isRead: false }));
  writeNotifications(updated);
  // ✅️ 一括未読化の副作用（キャッシュ無効化）もデータ層が担保している。
  // 将来 markAllAsUnread() の呼び出し元が増えても、
  // 各呼び出し元に revalidateTag の追記は不要。
  // ⚠️ 実装漏れの注意: この関数を新しい Server Action や Route Handler から呼ぶ場合、
  // revalidateTag の呼び出しはここで完結しているため追加対応は不要。
  // ただし Client Component から直接呼ぼうとすると実行時エラーになるため、
  // 必ず Server Action・Route Handler 経由で呼ぶこと。
  revalidateTag(NOTIFICATIONS_CACHE_TAG);
}
