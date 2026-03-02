"use client";

import { useRouter } from "next/navigation";

type Props = {
  href: string;
};

// router.push() の直後に router.refresh() を呼び、クライアント側の Router Cache を破棄する。
// サーバー側に revalidateTag / revalidatePath 相当のキャッシュエントリが存在しなくても、
// ブラウザが保持している RSC ペイロードのキャッシュを無効化できるため、
// 一覧ページが再レンダリングされ最新の既読状態が反映される。
export function BackToListButtonRefresh({ href }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
    // ✅️ router.refresh() でクライアント側 Router Cache を破棄する。
    // これにより、サーバー側に Data Cache / Full Route Cache が存在しなくても
    // 一覧ページが最新状態で再表示される。
    router.refresh();
  };

  return (
    <button onClick={handleClick} style={buttonStyle} data-testid="back-to-list-button">
      ← 通知一覧に戻る
    </button>
  );
}

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: "24px",
  background: "none",
  border: "none",
  color: "var(--color-primary)",
  fontSize: "14px",
  cursor: "pointer",
  padding: 0,
};
