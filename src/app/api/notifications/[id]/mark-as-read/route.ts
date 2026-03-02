import { getNotificationById, markAsRead } from "../../../../../lib/notifications";
import { NextResponse } from "next/server";

type Params = {
  params: { id: string };
};

export function PATCH(_request: Request, { params }: Params): NextResponse {
  const notification = getNotificationById(params.id);

  if (!notification) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!notification.isRead) {
    markAsRead(params.id);
  }

  return NextResponse.json({ ...notification, isRead: true });
}
