import "server-only";

import fs from "fs";
import path from "path";
import { revalidateTag } from "next/cache";

export const NOTIFICATIONS_CACHE_TAG = "notifications";

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
  revalidateTag(NOTIFICATIONS_CACHE_TAG);
}

export function markAllAsUnread(): void {
  const notifications = readNotifications();
  const updated = notifications.map((n): Notification => ({ ...n, isRead: false }));
  writeNotifications(updated);
  revalidateTag(NOTIFICATIONS_CACHE_TAG);
}
