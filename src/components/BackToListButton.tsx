"use client";

export function BackToListButton() {
  const handleClick = () => {
    window.location.href = "/notification";
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
  color: "#1976d2",
  fontSize: "14px",
  cursor: "pointer",
  padding: 0,
};
