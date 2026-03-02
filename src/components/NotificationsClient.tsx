"use client";

// Client Component として通知一覧をフェッチ・表示するコンポーネント。
//
// キャッシュ構成:
//   - サーバーサイドキャッシュ（Router Cache / Full Route Cache / Data Cache）を一切使わない
//   - ブラウザの fetch キャッシュは cache: "no-store" で無効化する
//   - コンポーネントのローカル state として通知リストを保持する
//
// キャッシュクリアの単位:
//   - refetch() を呼ぶと /api/notifications を再 fetch してこのコンポーネントの state だけ更新される
//   - router.refresh() が不要なため、ページ全体の RSC ペイロードを破棄しない
//   - 他の Server Component（ヘッダー・フッター等）の再レンダリングは発生しない

import { useEffect, useState, useCallback } from "react";
import type { Notification } from "../lib/notifications";
import { Notifications } from "./Notifications";

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; notifications: Notification[] };

type Props = {
  basePath?: string;
};

export function NotificationsClient({ basePath = "/notification-with-use-client" }: Props) {
  const [fetchState, setFetchState] = useState<FetchState>({ status: "loading" });

  const refetch = useCallback((): void => {
    setFetchState({ status: "loading" });

    fetch("/api/notifications", { cache: "no-store" })
      .then((res): Promise<Notification[]> => {
        if (!res.ok) {
          return Promise.reject(new Error(`HTTP ${res.status}`));
        }
        return res.json() as Promise<Notification[]>;
      })
      .then((notifications): void => {
        setFetchState({ status: "success", notifications });
      })
      .catch((err: unknown): void => {
        const message = err instanceof Error ? err.message : "Unknown error";
        setFetchState({ status: "error", message });
      });
  }, []);

  useEffect((): (() => void) => {
    refetch();

    // 詳細ページから戻ってきたとき（SPA ナビゲーション後のタブ復帰を含む）に
    // コンポーネントが再マウントされない場合でも最新状態を取得するため、
    // visibilitychange で再フェッチする。
    // → router.refresh() のようにページ全体の RSC ペイロードを破棄せず、
    //   このコンポーネントの state だけを更新できる。
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return (): void => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  if (fetchState.status === "loading") {
    return <p>読み込み中...</p>;
  }

  if (fetchState.status === "error") {
    return <p>通知の取得に失敗しました: {fetchState.message}</p>;
  }

  return <Notifications notifications={fetchState.notifications} basePath={basePath} />;
}
