import { defineConfig } from "vitest/config";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
// server-onlyパッケージのディレクトリを特定し、"react-server"条件下で選択される
// empty.js(何もしない空モジュール)への絶対パスを組み立てる。
// Next.jsのReact Server Component環境ではバンドラーが同ファイルを選択するため、
// テスト環境でも同等の動作が再現できる。
const serverOnlyEmptyPath = path.join(path.dirname(require.resolve("server-only")), "empty.js");

export default defineConfig({
  test: {
    environment: "node",
    alias: {
      "server-only": serverOnlyEmptyPath,
    },
  },
});
