"use client";

import { useRouter } from "next/navigation";

type Props = {
  href: string;
};

// router.push() で一覧に戻るボタン。
// router.refresh() を呼ばないため Router Cache がそのまま使われる。
// BackToListButton（window.location.href でフルリロード）との違いを示す比較用コンポーネント。
export function BackToListButtonRouter({ href }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
    // router.refresh() を意図的に呼ばない
    // → Router Cache が古い RSC ペイロードを返すため、一覧が未読のままになる
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
