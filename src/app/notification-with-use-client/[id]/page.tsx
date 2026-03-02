"use client";

// use client コンポーネントでクライアント側フェッチを行うデモ詳細ページ。
//
// 既読処理の流れ:
//   1. マウント時に GET /api/notifications/[id] で通知を取得する
//   2. 未読の場合は PATCH /api/notifications/[id]/mark-as-read で既読にする
//   3. 一覧に戻ると visibilitychange により NotificationsClient が再 fetch し
//      既読状態が反映される
//
// router.refresh() を呼ばないため、ページ全体の RSC ペイロードは破棄されない。
// 既読状態の更新範囲は NotificationsClient コンポーネントの state に限定される。

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Notification } from "../../../lib/notifications";
import { NotificationDetail } from "../../../components/NotificationDetail";
import { BackToTopLink } from "../../../components/BackToTopLink";
import { mainStyle } from "../../../styles/common";

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "not-found" }
  | { status: "success"; notification: Notification };

type Props = {
  params: { id: string };
};

export default function NotificationWithUseClientDetailPage({ params }: Props) {
  const router = useRouter();
  const [fetchState, setFetchState] = useState<FetchState>({ status: "loading" });

  useEffect((): void => {
    fetch(`/api/notifications/${params.id}/mark-as-read`, {
      method: "PATCH",
      cache: "no-store",
    })
      .then((res): Promise<Notification> => {
        if (res.status === 404) {
          return Promise.reject(new Error("not-found"));
        }
        if (!res.ok) {
          return Promise.reject(new Error(`HTTP ${res.status}`));
        }
        return res.json() as Promise<Notification>;
      })
      .then((notification): void => {
        setFetchState({ status: "success", notification });
      })
      .catch((err: unknown): void => {
        const message = err instanceof Error ? err.message : "Unknown error";
        if (message === "not-found") {
          setFetchState({ status: "not-found" });
        } else {
          setFetchState({ status: "error", message });
        }
      });
  }, [params.id]);

  if (fetchState.status === "loading") {
    return (
      <main style={mainStyle}>
        <p>読み込み中...</p>
      </main>
    );
  }

  if (fetchState.status === "not-found") {
    return (
      <main style={mainStyle}>
        <p>通知が見つかりません。</p>
      </main>
    );
  }

  if (fetchState.status === "error") {
    return (
      <main style={mainStyle}>
        <p>通知の取得に失敗しました: {fetchState.message}</p>
      </main>
    );
  }

  return (
    <main style={mainStyle}>
      <BackToTopLink />
      <button
        onClick={(): void => router.push("/notification-with-use-client")}
        style={backButtonStyle}
        data-testid="back-to-list-button"
      >
        ← 通知一覧に戻る
      </button>
      <NotificationDetail notification={fetchState.notification} />
    </main>
  );
}

const backButtonStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: "24px",
  background: "none",
  border: "none",
  color: "var(--color-primary)",
  fontSize: "14px",
  cursor: "pointer",
  padding: 0,
};
