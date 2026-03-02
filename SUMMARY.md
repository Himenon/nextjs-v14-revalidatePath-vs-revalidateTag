# revalidatePath と revalidateTag の設計・振る舞い・変更時の障害調査

## 1. Next.js のキャッシュ構造

Next.js には独立した3層のキャッシュがある。

```mermaid
sequenceDiagram
    participant B as ブラウザ
    participant RC as Router Cache（クライアント）
    participant FRC as Full Route Cache（サーバー）
    participant DC as Data Cache（サーバー）
    participant FS as JSONファイル

    B->>RC: ページ要求
    alt Router Cache HIT
        RC-->>B: キャッシュから即表示
    else Router Cache MISS
        RC->>FRC: サーバーへ転送
        alt Full Route Cache HIT
            FRC-->>B: キャッシュHTMLを返す
        else Full Route Cache MISS（または force-dynamic）
            FRC->>DC: データ取得
            alt Data Cache HIT
                DC-->>FRC: キャッシュデータを返す
            else Data Cache MISS
                DC->>FS: fs.readFileSync()
                FS-->>DC: JSONデータ
                DC-->>FRC: データを返す
            end
            FRC-->>B: 生成したHTMLを返す
        end
    end

    Note over RC: router.refresh() で無効化
    Note over FRC: revalidatePath() で無効化
    Note over DC: revalidateTag() で無効化
```

---

## 2. revalidatePath の設計と振る舞い

### 設計上の役割

指定したURLパスに対応する Full Route Cache を削除する。
次のリクエスト時にサーバーがページを再レンダリングし、最新のHTMLを生成する。

### 振る舞い

```mermaid
sequenceDiagram
    participant Page as NotificationDetailPage
    participant NC as next/cache
    participant FRC as Full Route Cache
    participant S as サーバー
    participant FS as JSONファイル
    participant B as ブラウザ

    Page->>NC: revalidatePath("/notification")
    NC->>FRC: "/notification" のキャッシュを削除
    Note over FRC: エントリが削除される

    Page->>NC: revalidatePath("/embed/notification")
    NC->>FRC: "/embed/notification" のキャッシュを削除
    Note over FRC: エントリが削除される

    B->>S: GET /notification
    S->>FRC: キャッシュ確認
    Note over FRC: MISS のため再実行
    S->>FS: getAllNotifications() → readFileSync()
    FS-->>S: 最新のJSON
    S-->>B: 最新の通知一覧HTML
```

### 特徴

- 無効化の対象はURLパスであり、データの種類ではない
- 呼び出し側がどのページに影響するかを全て列挙する必要がある
- 同じ通知データを表示するページが増えるたびに呼び出しを追加しなければならない

---

## 3. revalidateTag の設計と振る舞い

### 設計上の役割

指定したタグに紐づく Data Cache のエントリを削除する。
そのタグが付いた `fetch()` または `unstable_cache()` の結果が次回呼び出し時に再取得される。

### 振る舞い（unstable_cache を使っている場合）

```mermaid
sequenceDiagram
    participant Page as NotificationDetailPage
    participant NC as next/cache
    participant DC as Data Cache
    participant S as サーバー
    participant FS as JSONファイル
    participant B as ブラウザ

    Note over DC: "notifications" タグで<br/>キャッシュ済みのデータがある状態

    Page->>NC: revalidateTag("notifications")
    NC->>DC: "notifications" タグのエントリを削除
    Note over DC: エントリが削除される

    B->>S: GET /notification
    S->>DC: getAllNotifications()（タグ確認）
    Note over DC: MISS のため再実行
    DC->>FS: readFileSync()
    FS-->>DC: 最新のJSON
    DC-->>S: 最新データ（再キャッシュ保存）
    S-->>B: 最新の通知一覧HTML
```

### 特徴

- 無効化の対象はデータのタグであり、URLパスではない
- データ層が自分のタグを管理するため、呼び出し側はページ名を知る必要がない
- 通知データを表示するページが増えても、`revalidateTag` の呼び出し箇所は変わらない

---

## 4. 本プロジェクトの現状

### データ取得の実装

```typescript
// src/lib/notifications.ts
export function getAllNotifications(): Notification[] {
  return readNotifications(); // fs.readFileSync でJSONを読む
}
```

`fetch()` も `unstable_cache()` も使っていない。
Data Cache にエントリが存在しない状態。

### ページのキャッシュ設定

```typescript
// src/app/notification/page.tsx
export const dynamic = "force-dynamic";
```

`force-dynamic` により Full Route Cache が無効化されている。
毎リクエストでサーバーが必ずページを再実行する。

---

## 5. revalidatePath → revalidateTag 変更による障害分析

### 変更前のコード

```typescript
// src/app/notification/[id]/page.tsx（変更前）
markAsRead(params.id);
revalidatePath("/notification");
revalidatePath("/embed/notification");
```

### 変更後のコード（現在）

```typescript
// src/lib/notifications.ts（現在）
export function markAsRead(id: string): void {
  writeNotifications(updated);
  revalidateTag(NOTIFICATIONS_CACHE_TAG); // "notifications"
}
```

### 変更後に revalidateTag が行っている処理

```mermaid
sequenceDiagram
    participant M as markAsRead()
    participant NC as next/cache
    participant DC as Data Cache

    M->>NC: revalidateTag("notifications")
    NC->>DC: "notifications" タグのエントリを検索
    Note over DC: エントリが存在しない<br/>（unstable_cache 未使用）
    DC-->>NC: 対象なし
    Note over NC: 何も無効化されない<br/>（ノーオペレーション）
```

### ページが正しく更新される理由

`revalidateTag` は何もしていないが、ページは正しく更新される。
理由は `force-dynamic` が Full Route Cache を完全に無効化しているためである。

```mermaid
sequenceDiagram
    participant B as ブラウザ
    participant FRC as Full Route Cache
    participant S as サーバー
    participant FS as JSONファイル

    Note over FRC: force-dynamic により<br/>Full Route Cache は常に無効

    B->>S: GET /notification
    S->>FRC: キャッシュ確認
    Note over FRC: force-dynamic のため<br/>常に MISS として扱う
    S->>FS: getAllNotifications() → readFileSync()
    FS-->>S: 最新のJSON（既読状態含む）
    S-->>B: 最新の通知一覧HTML
```

### 障害が発生するか

**現在の実装では障害は発生しない。**
ただし、それは `revalidateTag` が機能しているためではない。
`force-dynamic` によって毎回サーバーレンダリングが走るため、
キャッシュ無効化の処理が空振りでも結果が一致している。

---

## 6. revalidateTag が機能するために必要な条件

`revalidateTag` を有効活用するには、データを `unstable_cache` でキャッシュする必要がある。

```typescript
// このように書いて初めて revalidateTag("notifications") が効く
export const getAllNotifications = unstable_cache(() => readNotifications(), ["notifications"], {
  tags: ["notifications"],
});
```

この構成にした場合の動作:

```mermaid
sequenceDiagram
    participant B as ブラウザ
    participant S as サーバー
    participant DC as Data Cache
    participant FS as JSONファイル

    Note over DC: 初回アクセス時（キャッシュなし）

    B->>S: GET /notification
    S->>DC: getAllNotifications()（"notifications" タグ付き）
    Note over DC: MISS
    DC->>FS: readFileSync()
    FS-->>DC: JSONデータ
    DC-->>S: データを返す
    Note over DC: "notifications" タグで<br/>キャッシュに保存
    S-->>B: HTMLを返す

    Note over FS: markAsRead() 呼び出し

    S->>FS: writeFileSync()（JSON更新）
    S->>DC: revalidateTag("notifications")
    Note over DC: "notifications" タグの<br/>キャッシュが削除される

    B->>S: 次回 GET /notification
    S->>DC: getAllNotifications()
    Note over DC: MISS（削除されたため）
    DC->>FS: readFileSync()
    FS-->>DC: 最新のJSON
    DC-->>S: 最新データ
    Note over DC: 再キャッシュ保存
    S-->>B: 最新のHTMLを返す
```

ただし `unstable_cache` を使う場合は `force-dynamic` との組み合わせに注意が必要である。
本プロジェクトでの検証では、開発サーバー上で `unstable_cache` と `force-dynamic` を
併用したとき E2E テストが失敗した。開発環境と本番環境でキャッシュの動作が異なるためである。

---

## 7. まとめ

| 項目                   | revalidatePath                                    | revalidateTag                                        |
| ---------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| 無効化の対象           | Full Route Cache（URLパス単位）                   | Data Cache（タグ単位）                               |
| 呼び出し側の知識       | ページのURLパスを全て列挙する必要がある           | データのタグ名だけ知ればよい                         |
| 前提条件               | 特になし                                          | fetch() または unstable_cache() でのキャッシュが必要 |
| 関心の分離             | 弱い（データ更新側がページ構成を知る）            | 強い（データ層がタグを管理する）                     |
| 本プロジェクトでの効力 | **有効**（Full Route Cache を実際に削除している） | **無効**（Data Cache に対象エントリが存在しない）    |
| 本プロジェクトでの障害 | なし                                              | なし（force-dynamic が代わりに機能しているため）     |

### 現状の評価

`revalidateTag` への変更は関心の分離という設計意図として正しい方向性である。
ただし現在の実装では `revalidateTag` は空振りしており、
ページの更新は `force-dynamic` によって担保されている。

`revalidateTag` を実際に機能させるには `unstable_cache` の導入が必要だが、
`force-dynamic` との干渉や開発環境でのキャッシュ挙動の不安定さを別途検証する必要がある。
