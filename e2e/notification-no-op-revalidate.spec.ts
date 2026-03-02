// revalidateTag / revalidatePath が no-op になるシナリオ（失敗デモ）
//
// このファイルは revalidateTag / revalidatePath を呼んでも、
// 無効化する対象となるキャッシュエントリが存在しない場合、
// 通知の既読状態が一覧に反映されないことを示す。
//
// 対応する実装ファイル:
//   - src/app/notification-no-op-revalidate/page.tsx
//     force-dynamic あり / RefreshOnBack なし
//     → ブラウザバック時に bfcache が復元され古い未読状態が表示される
//   - src/app/notification-no-op-revalidate/[id]/page.tsx
//     revalidateTag("notifications") → Data Cache にエントリがないため no-op
//     revalidatePath("/notification-no-op-revalidate") → Full Route Cache がないため no-op
//     BackToListButtonRouter: router.push() のみ（router.refresh() なし）
//     → Router Cache が古い RSC ペイロードを返し未読状態のままになる
//
// test.fail() の意味:
//   test.fail() を付けたテストは「失敗することが期待される」テストを表す。
//   アサーションが失敗した場合 → テスト全体は「合格」（期待通りに失敗した）
//   アサーションが成功した場合 → テスト全体は「不合格」（失敗するはずが成功してしまった）

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

test.describe("revalidateTag / revalidatePath no-op: 通知詳細ページを開いた後の一覧への戻り", () => {
  test.fail(
    "「通知一覧に戻る」ボタンで戻っても未読ラベルが既読に変化しない（revalidateTag / revalidatePath が no-op・router.push のみ）",
    async ({ page }) => {
      // 一覧ページを開く（Router Cache に RSC ペイロードが記録される）
      await page.goto("/notification-no-op-revalidate");
      await expect(page.getByTestId("read-status-1")).toHaveText("未読");

      // 詳細ページへ移動（サーバーで既読処理が実行される）
      // revalidateTag / revalidatePath を呼ぶが Data Cache / Full Route Cache が存在しないため no-op
      await page.getByTestId("notification-link-1").click();
      await page.waitForURL("**/notification-no-op-revalidate/1");
      await expect(page.getByTestId("detail-read-status")).toHaveText("既読");

      // 「通知一覧に戻る」ボタンで戻る（router.push のみ: Router Cache の古い RSC が返る）
      await page.getByTestId("back-to-list-button").click();
      await page.waitForURL("**/notification-no-op-revalidate");

      // 期待: 「既読」に変化しているべき
      // 実際: revalidateTag / revalidatePath が no-op のうえ Router Cache も残るため「未読」のまま → テスト失敗
      await expect(page.getByTestId("read-status-1")).toHaveText("既読");
    },
  );

  test.fail(
    "ブラウザバックで戻っても未読ラベルが既読に変化しない（RefreshOnBack なし・bfcache 復元）",
    async ({ page }) => {
      // 一覧ページを開く（bfcache にページが保存される）
      await page.goto("/notification-no-op-revalidate");
      await expect(page.getByTestId("read-status-1")).toHaveText("未読");

      // 詳細ページへ移動（サーバーで既読処理が実行される）
      // revalidateTag / revalidatePath を呼ぶが Data Cache / Full Route Cache が存在しないため no-op
      await page.getByTestId("notification-link-1").click();
      await page.waitForURL("**/notification-no-op-revalidate/1");

      // ブラウザバックで戻る（RefreshOnBack がないため bfcache が復元される）
      await page.goBack();
      await page.waitForURL("**/notification-no-op-revalidate");

      // 期待: 「既読」に変化しているべき
      // 実際: bfcache が古いページを復元するため「未読」のまま → テスト失敗
      await expect(page.getByTestId("read-status-1")).toHaveText("既読");
    },
  );
});
