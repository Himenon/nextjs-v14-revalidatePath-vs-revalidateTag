import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // テストデータファイルを共有するため、並列実行せず直列で実行する
  workers: 1,
  use: {
    baseURL: "http://localhost:3654",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3654",
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
