"use server";

import { markAsRead } from "../../lib/notifications";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(id: string): Promise<void> {
  markAsRead(id);
  revalidatePath("/notification");
  revalidatePath("/embed/notification");
}
