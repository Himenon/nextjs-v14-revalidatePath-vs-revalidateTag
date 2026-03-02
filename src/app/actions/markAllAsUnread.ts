"use server";

import { markAllAsUnread } from "../../lib/notifications";
import { revalidatePath } from "next/cache";

export async function markAllNotificationsAsUnread(): Promise<void> {
  markAllAsUnread();
  revalidatePath("/notification");
  revalidatePath("/embed/notification");
}
