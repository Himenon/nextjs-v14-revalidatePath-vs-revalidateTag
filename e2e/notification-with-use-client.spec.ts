// use client フェッチによるキャッシュクリアのデモ
//
// このファイルは Client Component（NotificationsClient）が /api/notifications を
// クライアント側でフェッチすることで、Router Cache / Full Route Cache / Data Cache を
// 経由せずに通知の既読状態を一覧へ反映できることを示す。
//
// 対応する実装ファイル:
//   - src/components/NotificationsClient.tsx
//     マウント時・visibilitychange 時に /api/notifications を再フェッチする。
//     router.refresh() を呼ばないため、ページ全体の RSC ペイロードは破棄されない。
//   - src/app/notification-with-use-client/page.tsx
//     Server Component として NotificationsClient を配置するだけ。
//   - src/app/notification-with-use-client/[id]/page.tsx
//     Client Component。マウント時に PATCH /api/notifications/[id]/mark-as-read を呼んで既読にする。
//   - src/app/api/notifications/route.ts
//     GET: 通知リストを返す（force-dynamic・cache: "no-store"）。
//   - src/app/api/notifications/[id]/mark-as-read/route.ts
//     PATCH: 指定 ID の通知を既読にして返す。
//
// 既読状態の反映の仕組み:
//   - 詳細ページで PATCH を呼んだ後、「通知一覧に戻る」ボタンで戻ると
//     SPA ナビゲーションにより NotificationsClient が再マウントされ、
//     マウント時の useEffect が /api/notifications を再フェッチする。
//   - ブラウザバックで戻ったときは visibilitychange イベントが発火し、
//     NotificationsClient の state が更新される。
//   - いずれの場合も router.refresh() を使わないため、
//     ページ全体の RSC ペイロードは再取得されない。

import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src/data/notifications.json");

const testNotificationList = [
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

test.beforeAll(() => {
  originalFileContent = fs.readFileSync(dataFilePath, "utf-8");
});

test.afterAll(() => {
  fs.writeFileSync(dataFilePath, originalFileContent, "utf-8");
});

test.beforeEach(() => {
  fs.writeFileSync(dataFilePath, JSON.stringify(testNotificationList, null, 2), "utf-8");
});

test.describe("通知一覧ページ (/notification-with-use-client)", () => {
  test("通知一覧ページに全ての通知が表示される", async ({ page }) => {
    await page.goto("/notification-with-use-client");

    await expect(page.getByTestId("notification-item-1")).toBeVisible();
    await expect(page.getByTestId("notification-item-2")).toBeVisible();
    await expect(page.getByTestId("notification-item-3")).toBeVisible();
  });

  test("未読の通知には「未読」ラベルが、既読の通知には「既読」ラベルが表示される", async ({
    page,
  }) => {
    await page.goto("/notification-with-use-client");

    await expect(page.getByTestId("read-status-1")).toHaveText("未読");
    await expect(page.getByTestId("read-status-2")).toHaveText("未読");
    await expect(page.getByTestId("read-status-3")).toHaveText("既読");
  });
});

test.describe("通知詳細ページ (/notification-with-use-client/:id)", () => {
  test("通知詳細ページを開くと、ページ内の通知ラベルが「既読」になる", async ({ page }) => {
    // マウント時に PATCH /api/notifications/[id]/mark-as-read が呼ばれ、既読状態で表示される
    await page.goto("/notification-with-use-client/1");

    await expect(page.getByTestId("detail-read-status")).toHaveText("既読");
  });
});

test.describe("通知一覧への戻り時の既読反映", () => {
  test("通知詳細ページを開いた後、「通知一覧に戻る」ボタンで戻ると既読ラベルが表示される", async ({
    page,
  }) => {
    // SPA ナビゲーションで戻ったとき、NotificationsClient が再マウントされ
    // useEffect の refetch により /api/notifications を再フェッチして state を更新する。
    // router.refresh() は使わないため RSC ペイロードは破棄されない。
    await page.goto("/notification-with-use-client");
    await expect(page.getByTestId("read-status-1")).toHaveText("未読");

    // 詳細ページへ移動（マウント時に PATCH が呼ばれ通知1が既読になる）
    await page.getByTestId("notification-link-1").click();
    await page.waitForURL("**/notification-with-use-client/1");
    await expect(page.getByTestId("detail-read-status")).toHaveText("既読");

    // 「通知一覧に戻る」ボタンで戻る（router.push → NotificationsClient が再マウント → refetch）
    await page.getByTestId("back-to-list-button").click();
    await page.waitForURL("**/notification-with-use-client");

    // 通知1のラベルが「既読」に変化していることを確認
    await expect(page.getByTestId("read-status-1")).toHaveText("既読");
  });

  test("通知詳細ページを開いた後、ブラウザバックで戻ると既読ラベルが表示される", async ({
    page,
  }) => {
    // ブラウザバックで戻ったとき、visibilitychange イベントが発火し
    // NotificationsClient の refetch が /api/notifications を再フェッチして state を更新する。
    // router.refresh() は使わないため RSC ペイロードは破棄されない。
    await page.goto("/notification-with-use-client");
    await expect(page.getByTestId("read-status-1")).toHaveText("未読");

    // 詳細ページへ移動（マウント時に PATCH が呼ばれ通知1が既読になる）
    await page.getByTestId("notification-link-1").click();
    await page.waitForURL("**/notification-with-use-client/1");

    // ブラウザバックで戻る（visibilitychange が発火 → refetch → state 更新）
    await page.goBack();
    await page.waitForURL("**/notification-with-use-client");

    // 通知1のラベルが「既読」に変化していることを確認
    await expect(page.getByTestId("read-status-1")).toHaveText("既読");
  });
});
