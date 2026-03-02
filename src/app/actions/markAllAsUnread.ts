"use server";

import { markAllAsUnread } from "../../lib/notifications";

export async function markAllNotificationsAsUnread(): Promise<void> {
  markAllAsUnread();
}
