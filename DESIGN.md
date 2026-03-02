Nextjsにおいて次の挙動を再現する機能を作ってください。

## Routing設計

### /notification

- ページ: 通知一覧
- `import 'server-only';` で動作する
- 通知一覧からブラウザバックで戻ってきたとき、未読→既読ラベルに変化すること

### /notification/:id

- ページ: 通知詳細
- `import 'server-only';` で動作する
- ページを開くと既読が処理が実行される

### /emmbed/notification

- ページ: 通知一覧が埋め込めたページ
- 通知一覧で利用されているコンポーネントが埋め込まれたページ
- `import 'server-only';`で動作する
- 通知一覧からブラウザバックで戻ってきたとき、未読→既読ラベルに変化すること

## コンポーネント設計

- `Notifications`
- 通知一覧がリストで表示される
  - 通知タイトル
  - 通知の既読・未読のラベル
  - 通知詳細へのリンク
- `NotificationDetail`
- 通知タイトル
- 通知の既読・未読のラベル
- EmmbedNotification
  - `Notifications` が埋め込まれたページ

## ストレージ

- 通知の実体はJSONファイルでローカルに保存して良い。

## UIデザイン

- Pure CSSの簡易なスタイル実装で良い。
