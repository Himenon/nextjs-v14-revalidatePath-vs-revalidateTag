# Next.js キャッシュ無効化アプローチ比較

`revalidateTag` と `revalidatePath` を**関心の分離**の観点から比較するためのプロジェクト。

## テーマ: 関心の分離

キャッシュ無効化の責務を「データ層」に置くか「ページ層」に置くかで設計の複雑さが変わる。

| アプローチ           | キャッシュ無効化の責務         | ページが他ページの URL を知る必要 |
| -------------------- | ------------------------------ | --------------------------------- |
| `revalidateTag`      | データ層（`notifications.ts`） | **不要**                          |
| `revalidatePath`     | ページ・Server Action          | **必要**（全 URL を列挙）         |
| キャッシュ無効化なし | なし                           | —                                 |

## ルート構成

```
/notification                    ← revalidateTag（本実装）
/notification-revalidate-path    ← revalidatePath（比較用）
/notification-no-revalidate      ← 無効化なし（失敗デモ）
/notification-no-op-revalidate   ← revalidateTag が no-op・router.refresh() で更新（デモ）
/notification-with-use-client    ← use client フェッチ・コンポーネント単位キャッシュクリア（デモ）
/embed/notification              ← 埋め込み表示（revalidateTag の恩恵を受ける）
```

## 実装ファイル対応

| ルート                           | ページ                                   | データ層                                   | キャッシュ無効化                                                       |
| -------------------------------- | ---------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| `/notification`                  | `src/app/notification/`                  | `src/lib/notifications.ts`                 | `revalidateTag` をデータ層内で呼ぶ                                     |
| `/notification-revalidate-path`  | `src/app/notification-revalidate-path/`  | `src/lib/notifications-revalidate-path.ts` | ページ・Server Action が `revalidatePath` を列挙                       |
| `/notification-no-revalidate`    | `src/app/notification-no-revalidate/`    | `src/lib/notifications-revalidate-path.ts` | 呼ばない                                                               |
| `/notification-no-op-revalidate` | `src/app/notification-no-op-revalidate/` | `src/lib/notifications.ts`                 | `revalidateTag` / `revalidatePath` は no-op・`router.refresh()` で更新 |
| `/notification-with-use-client`  | `src/app/notification-with-use-client/`  | `src/app/api/notifications/`               | サーバーキャッシュを使わず Client Component の state のみ更新          |
| `/embed/notification`            | `src/app/embed/notification/`            | `src/lib/notifications.ts`                 | `revalidateTag` をデータ層内で呼ぶ（`/notification` と共有）           |

## revalidateTag の設計上の利点

```ts
// ✅ ページは「既読にする」という意図だけを表明する
markAsRead(params.id);
// revalidateTag はデータ層の内部で完結 → ページが他ページの URL を知らなくてよい
```

## revalidatePath の設計上の問題点

```ts
// ⚠️ ページが他ページの URL を全て知っている（関心の分離違反）
markAsRead(params.id);
revalidatePath("/notification");
revalidatePath("/notification-revalidate-path"); // ← 追加したら全箇所に追記が必要
revalidatePath("/embed/notification");
```

## Next.js キャッシュ層の構造

```
ブラウザ（'use client'）
  └─ Router Cache
       ├─ 訪問済みページの RSC ペイロードをブラウザが保持する
       ├─ router.refresh() で破棄できる
       └─ revalidatePath / revalidateTag では破棄できない

サーバー（'use server'）
  ├─ Full Route Cache
  │    ├─ サーバーがレンダリング済みの HTML / RSC ペイロードを保持する
  │    ├─ force-dynamic を設定すると生成されない（毎回再レンダリング）
  │    └─ revalidatePath / revalidateTag で破棄できる
  └─ Data Cache
       ├─ unstable_cache や fetch + next: { tags } でタグを付けて保存したデータを保持する
       └─ revalidateTag(タグ名) でそのタグが付いた保存データを削除できる
```

## revalidateTag の実装上の注意点

- `revalidateTag` が有効なのは対象データが `unstable_cache` でラップされている場合のみ
- 現在は `fs.readFileSync` を直接使用しているため `revalidateTag` は **no-op**（`force-dynamic` が代わりに機能している）
- Router Cache（クライアントサイド）は無効化しない。クライアントナビゲーションには `router.refresh()` の併用が必要
- Server Components / Server Actions / Route Handlers からのみ呼び出せる

## E2E テスト

```
e2e/notification.spec.ts                  # revalidateTag → 全テスト通過
e2e/notification-revalidate-path.spec.ts  # revalidatePath → 全テスト通過
e2e/notification-no-revalidate.spec.ts    # 無効化なし → test.fail() で失敗を明示
```

## 開発コマンド

```bash
pnpm dev          # 開発サーバー起動（ポート 3654）
pnpm test         # ユニットテスト（Vitest）
pnpm test:e2e     # E2E テスト（Playwright）
pnpm lint         # 静的解析（oxlint）
pnpm unused       # 未使用コード検出（knip）
```
