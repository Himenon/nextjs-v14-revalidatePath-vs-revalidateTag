import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import assert from "node:assert";
import fs from "fs";

// server-onlyはNext.jsのサーバーサイドバンドルでのみ動作するパッケージだが、
// VitestはNode.js環境で実行されるため空モジュールに差し替える。
// スコープ: このテストファイル全体。
vi.mock("server-only", () => ({}));

// next/cacheのrevalidatePathはNext.jsランタイムを必要とするため呼び出し記録のみ行う関数に差し替える。
// 目的: Next.jsランタイムなしにrevalidatePathが正しいパスで呼び出されることを検証する。
// スコープ: このテストファイル全体。
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import type { Notification } from "../../lib/notifications";
import { getNotificationById } from "../../lib/notifications";
import { markNotificationAsRead } from "./markAsRead";
import { revalidatePath } from "next/cache";

const initialNotificationList: Notification[] = [
  {
    id: "1",
    title: "システムメンテナンスのお知らせ",
    body: "メンテナンスを実施します。",
    isRead: false,
  },
];

describe("markNotificationAsRead: 通知既読化アクション", () => {
  let inMemoryNotifications: Notification[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    inMemoryNotifications = structuredClone(initialNotificationList);
    vi.spyOn(fs, "readFileSync").mockImplementation(() => JSON.stringify(inMemoryNotifications));
    vi.spyOn(fs, "writeFileSync").mockImplementation((_file, data) => {
      inMemoryNotifications = JSON.parse(data as string) as Notification[];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("指定したIDの通知が既読になる", async () => {
    await markNotificationAsRead("1");

    const notification: Notification | undefined = getNotificationById("1");
    assert(notification !== undefined);
    expect(notification.isRead).toBe(true);
  });

  it("通知一覧ページのサーバーキャッシュが無効化される", async () => {
    // DESIGN.md要件: ブラウザバックで戻ったとき既読状態が反映される
    // → revalidatePathが/notificationで呼ばれることで、サーバーキャッシュが最新化される
    await markNotificationAsRead("1");

    expect(revalidatePath).toHaveBeenCalledWith("/notification");
  });

  it("埋め込み通知一覧ページのサーバーキャッシュが無効化される", async () => {
    await markNotificationAsRead("1");

    expect(revalidatePath).toHaveBeenCalledWith("/embed/notification");
  });
});
