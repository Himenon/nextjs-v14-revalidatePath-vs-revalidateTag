import "server-only";

// revalidatePath を使うアプローチの比較用実装。
// revalidateTag アプローチとの違い:
//   - データ層はキャッシュ無効化を一切担当しない
//   - 書き込み後のキャッシュ無効化はページ・Server Action 側が revalidatePath で担う
//   - データ層の責務が「読み書き」のみに絞られるが、
//     呼び出し側が影響するページの URL を全て列挙しなければならない

import fs from "fs";
import path from "path";

export type Notification = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
};

const dataFilePath = path.join(process.cwd(), "src/data/notifications.json");

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
  // キャッシュ無効化はしない。呼び出し側が revalidatePath を担当する。
}

export function markAllAsUnread(): void {
  const notifications = readNotifications();
  const updated = notifications.map((n): Notification => ({ ...n, isRead: false }));
  writeNotifications(updated);
  // キャッシュ無効化はしない。呼び出し側が revalidatePath を担当する。
}
