// キャッシュ無効化アプローチ: revalidatePath
//
// 対応する実装ファイル:
//   - src/lib/notifications-revalidate-path.ts
//     markAsRead / markAllAsUnread はキャッシュ無効化を行わない。
//     データ層はキャッシュに無関心。
//   - src/app/notification-revalidate-path/[id]/page.tsx
//     markAsRead() の後に revalidatePath("/notification") と
//     revalidatePath("/embed/notification") を明示的に列挙する。
//     このページが通知データを表示する全ページの URL を知っている必要がある。
//   - src/app/actions/markAllAsUnread-revalidate-path.ts
//     markAllAsUnread() の後に revalidatePath を明示的に列挙する。
//
// revalidateTag アプローチとの比較は以下を参照:
//   e2e/notification.spec.ts

import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src/data/notifications.json");

// テスト用の通知リスト。各テストはこの状態を初期状態として開始する。
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

test.describe("通知一覧ページ (/notification)", () => {
  test("通知一覧ページに全ての通知が表示される", async ({ page }) => {
    await page.goto("/notification");

    await expect(page.getByTestId("notification-item-1")).toBeVisible();
    await expect(page.getByTestId("notification-item-2")).toBeVisible();
    await expect(page.getByTestId("notification-item-3")).toBeVisible();
  });

  test("未読の通知には「未読」ラベルが、既読の通知には「既読」ラベルが表示される", async ({
    page,
  }) => {
    await page.goto("/notification");

    await expect(page.getByTestId("read-status-1")).toHaveText("未読");
    await expect(page.getByTestId("read-status-2")).toHaveText("未読");
    await expect(page.getByTestId("read-status-3")).toHaveText("既読");
  });
});

test.describe("通知詳細ページ (/notification-revalidate-path/:id)", () => {
  test("通知詳細ページを開くと、ページ内の通知ラベルが「既読」になる", async ({ page }) => {
    // DESIGN.md要件: ページを開くと既読処理が実行される
    // revalidatePath アプローチ: page.tsx が markAsRead() の後に
    // revalidatePath("/notification") / revalidatePath("/embed/notification") を呼ぶ
    await page.goto("/notification-revalidate-path/1");

    await expect(page.getByTestId("detail-read-status")).toHaveText("既読");
  });
});

test.describe("通知一覧への戻り時の既読反映", () => {
  test("通知詳細ページを開いた後、「通知一覧に戻る」ボタンで戻ると既読ラベルが表示される", async ({
    page,
  }) => {
    // DESIGN.md要件: 通知一覧からブラウザバックで戻ってきたとき、未読→既読ラベルに変化すること
    // revalidatePath アプローチ: Full Route Cache が削除されるため、
    // 次のアクセス時にサーバーが NotificationPage を再実行して最新の既読状態を返す
    await page.goto("/notification");
    await expect(page.getByTestId("read-status-1")).toHaveText("未読");

    // 通知詳細ページへ移動（サーバーが既読処理と revalidatePath を実行する）
    await page.goto("/notification-revalidate-path/1");
    await expect(page.getByTestId("detail-read-status")).toHaveText("既読");

    // 「通知一覧に戻る」ボタンで戻る
    await page.getByTestId("back-to-list-button").click();
    await page.waitForURL("**/notification");

    // 通知1のラベルが「既読」に変化していることを確認
    await expect(page.getByTestId("read-status-1")).toHaveText("既読");
  });

  test("通知詳細ページを開いた後、ブラウザバックで戻ると既読ラベルが表示される", async ({
    page,
  }) => {
    // DESIGN.md要件: 通知一覧からブラウザバックで戻ってきたとき、未読→既読ラベルに変化すること
    // revalidatePath アプローチ: Full Route Cache が削除されるため、
    // window.location.reload() による再アクセス時に最新の既読状態が返る
    await page.goto("/notification");
    await expect(page.getByTestId("read-status-1")).toHaveText("未読");

    // 通知詳細ページへ移動（サーバーが既読処理と revalidatePath を実行する）
    await page.goto("/notification-revalidate-path/1");

    // ブラウザバックで戻る（RefreshOnBack の popstate リスナーが window.location.reload() を呼ぶ）
    await page.goBack();
    await page.waitForURL("**/notification");

    // 通知1のラベルが「既読」に変化していることを確認
    await expect(page.getByTestId("read-status-1")).toHaveText("既読");
  });
});

test.describe("埋め込み通知一覧ページ (/embed/notification)", () => {
  test("埋め込みページに通知一覧が表示される", async ({ page }) => {
    await page.goto("/embed/notification");

    await expect(page.getByTestId("notification-item-1")).toBeVisible();
    await expect(page.getByTestId("notification-item-2")).toBeVisible();
    await expect(page.getByTestId("notification-item-3")).toBeVisible();
  });

  test("埋め込みページから通知詳細を開いた後、ブラウザバックで戻ると既読ラベルが表示される", async ({
    page,
  }) => {
    // DESIGN.md要件: 通知一覧からブラウザバックで戻ってきたとき、未読→既読ラベルに変化すること
    // revalidatePath アプローチ: page.tsx が
    // revalidatePath("/embed/notification") を明示的に呼んでいるため、
    // 埋め込みページの Full Route Cache も削除される
    await page.goto("/embed/notification");
    await expect(page.getByTestId("read-status-2")).toHaveText("未読");

    // 通知詳細ページへ移動（サーバーが既読処理と revalidatePath を実行する）
    await page.goto("/notification-revalidate-path/2");

    // ブラウザバックで埋め込みページに戻る（RefreshOnBack の popstate リスナーが発火する）
    await page.goBack();
    await page.waitForURL("**/embed/notification");

    // 通知2のラベルが「既読」に変化していることを確認
    await expect(page.getByTestId("read-status-2")).toHaveText("既読");
  });
});
