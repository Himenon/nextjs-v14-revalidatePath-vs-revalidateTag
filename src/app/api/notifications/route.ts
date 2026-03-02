import { getAllNotifications } from "../../../lib/notifications";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(): NextResponse {
  const notifications = getAllNotifications();
  return NextResponse.json(notifications);
}
