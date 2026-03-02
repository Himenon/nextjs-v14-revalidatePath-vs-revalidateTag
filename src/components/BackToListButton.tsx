"use client";

import { useRouter } from "next/navigation";

export function BackToListButton() {
  const router = useRouter();

  const handleClick = () => {
    router.refresh();
    router.push("/notification");
  };

  return (
    <button onClick={handleClick} style={buttonStyle}>
      ← 通知一覧に戻る
    </button>
  );
}

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: "24px",
  background: "none",
  border: "none",
  color: "#1976d2",
  fontSize: "14px",
  cursor: "pointer",
  padding: 0,
};
