// キャッシュ無効化なし（失敗デモ）
//
// このファイルは revalidateTag / revalidatePath を使わないと
// 通知の既読状態が一覧に反映されないことを示す。
//
// 対応する実装ファイル:
//   - src/app/notification-no-revalidate/page.tsx
//     force-dynamic なし / RefreshOnBack なし
//     → ブラウザバック時に bfcache が復元され古い未読状態が表示される
//   - src/app/notification-no-revalidate/[id]/page.tsx
//     markAsRead() を呼ぶが revalidatePath も revalidateTag も呼ばない
//     BackToListButtonRouter: router.push() のみ（router.refresh() なし）
//     → Router Cache が古い RSC ペイロードを返し未読状態のままになる
//
// test.fail() の意味:
//   test.fail() を付けたテストは「失敗することが期待される」テストを表す。
//   アサーションが失敗した場合 → テスト全体は「合格」（期待通りに失敗した）
//   アサーションが成功した場合 → テスト全体は「不合格」（失敗するはずが成功してしまった）
//
// revalidateTag / revalidatePath アプローチとの比較:
//   e2e/notification.spec.ts
//   e2e/notification-revalidate-path.spec.ts

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

test.describe("キャッシュ無効化なし: 通知詳細ページを開いた後の一覧への戻り", () => {
  test.fail(
    "「通知一覧に戻る」ボタンで戻っても未読ラベルが既読に変化しない（router.push のみ・refresh なし）",
    async ({ page }) => {
      // 一覧ページを開く（Router Cache に RSC ペイロードが記録される）
      await page.goto("/notification-no-revalidate");
      await expect(page.getByTestId("read-status-1")).toHaveText("未読");

      // 詳細ページへ移動（サーバーで既読処理が実行されるが revalidate は呼ばれない）
      await page.getByTestId("notification-link-1").click();
      await page.waitForURL("**/notification-no-revalidate/1");
      await expect(page.getByTestId("detail-read-status")).toHaveText("既読");

      // 「通知一覧に戻る」ボタンで戻る（router.push のみ: Router Cache の古い RSC が返る）
      await page.getByTestId("back-to-list-button").click();
      await page.waitForURL("**/notification-no-revalidate");

      // 期待: 「既読」に変化しているべき
      // 実際: Router Cache が古い RSC ペイロードを返すため「未読」のまま → テスト失敗
      await expect(page.getByTestId("read-status-1")).toHaveText("既読");
    },
  );

  test.fail(
    "ブラウザバックで戻っても未読ラベルが既読に変化しない（RefreshOnBack なし・bfcache 復元）",
    async ({ page }) => {
      // 一覧ページを開く（bfcache にページが保存される）
      await page.goto("/notification-no-revalidate");
      await expect(page.getByTestId("read-status-1")).toHaveText("未読");

      // 詳細ページへ移動（サーバーで既読処理が実行されるが revalidate は呼ばれない）
      await page.getByTestId("notification-link-1").click();
      await page.waitForURL("**/notification-no-revalidate/1");

      // ブラウザバックで戻る（RefreshOnBack がないため bfcache が復元される）
      await page.goBack();
      await page.waitForURL("**/notification-no-revalidate");

      // 期待: 「既読」に変化しているべき
      // 実際: bfcache が古いページを復元するため「未読」のまま → テスト失敗
      await expect(page.getByTestId("read-status-1")).toHaveText("既読");
    },
  );
});
