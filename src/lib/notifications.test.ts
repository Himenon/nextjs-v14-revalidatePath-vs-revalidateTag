import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import assert from "node:assert";
import fs from "fs";
import path from "path";

// server-onlyのモックは不要。
// vitest.config.tsでresolve.conditions: ["react-server"]を設定しているため、
// server-onlyはサーバー環境と同じ空モジュール(empty.js)として解決される。

import type { Notification } from "./notifications";
import {
  getAllNotifications,
  getNotificationById,
  markAllAsUnread,
  markAsRead,
} from "./notifications";

const dataFilePath = path.join(process.cwd(), "src/data/notifications.json");

const testNotificationList: Notification[] = [
  {
    id: "1",
    title: "システムメンテナンスのお知らせ",
    body: "メンテナンスを実施します。",
    isRead: false,
  },
  { id: "2", title: "新機能リリースのお知らせ", body: "新機能が追加されました。", isRead: false },
  { id: "3", title: "利用規約改定のお知らせ", body: "利用規約が改定されました。", isRead: true },
];

let originalFileContent: string;

beforeAll(() => {
  originalFileContent = fs.readFileSync(dataFilePath, "utf-8");
});

afterAll(() => {
  fs.writeFileSync(dataFilePath, originalFileContent, "utf-8");
});

beforeEach(() => {
  fs.writeFileSync(dataFilePath, JSON.stringify(testNotificationList, null, 2), "utf-8");
});

describe("通知データ操作", () => {
  describe("getAllNotifications: 通知一覧の取得", () => {
    it("通知一覧画面に表示される全ての通知を返す", () => {
      const notifications: Notification[] = getAllNotifications();
      expect(notifications).toHaveLength(3);
    });
  });

  describe("getNotificationById: IDによる通知の取得", () => {
    it("指定したIDに一致する通知を返す", () => {
      const notification: Notification | undefined = getNotificationById("1");
      assert(notification !== undefined);
      expect(notification.title).toBe("システムメンテナンスのお知らせ");
    });

    it("存在しないIDを指定したとき、通知が見つからないことを示すundefinedを返す", () => {
      const notification: Notification | undefined = getNotificationById("999");
      expect(notification).toBeUndefined();
    });
  });

  describe("markAsRead: 通知の既読化", () => {
    it("指定した通知の既読状態がfalseからtrueに変化する", () => {
      markAsRead("1");

      const notification: Notification | undefined = getNotificationById("1");
      assert(notification !== undefined);
      expect(notification.isRead).toBe(true);
    });

    it("通知詳細ページを開いた後に通知一覧を取得すると、開いた通知の既読状態がtrueになっている", () => {
      // DESIGN.md要件: ページを開くと既読処理が実行される
      // → markAsRead呼び出し後、getAllNotificationsで取得した一覧に既読状態が反映されることを確認する
      markAsRead("2");

      const notifications: Notification[] = getAllNotifications();
      const target: Notification | undefined = notifications.find((n) => n.id === "2");
      assert(target !== undefined);
      expect(target.isRead).toBe(true);
    });

    it("既読化した通知以外の既読状態は変化しない", () => {
      markAsRead("1");

      const notification: Notification | undefined = getNotificationById("2");
      assert(notification !== undefined);
      expect(notification.isRead).toBe(false);
    });

    it("すでに既読だった通知をmarkAsReadで処理しても、既読状態が維持される", () => {
      markAsRead("3");

      const notification: Notification | undefined = getNotificationById("3");
      assert(notification !== undefined);
      expect(notification.isRead).toBe(true);
    });
  });

  describe("markAllAsUnread: 全通知の未読化", () => {
    it("全ての通知の既読状態がfalseになる", () => {
      markAllAsUnread();

      getAllNotifications().forEach((n) => {
        expect(n.isRead, `通知(id: ${n.id})の既読状態`).toBe(false);
      });
    });

    it("既読だった通知が未読に変化する", () => {
      // id:3は初期状態で既読(isRead: true)
      markAllAsUnread();

      const notification: Notification | undefined = getNotificationById("3");
      assert(notification !== undefined);
      expect(notification.isRead).toBe(false);
    });

    it("全通知を未読にした後、通知一覧を取得すると未読状態が反映されている", () => {
      markAllAsUnread();

      const notifications: Notification[] = getAllNotifications();
      const readCount: number = notifications.filter((n) => n.isRead).length;
      expect(readCount).toBe(0);
    });
  });
});
