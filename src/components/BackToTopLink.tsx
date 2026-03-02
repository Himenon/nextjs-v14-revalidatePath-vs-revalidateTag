import Link from "next/link";

export function BackToTopLink() {
  return (
    <Link href="/" style={linkStyle}>
      ← トップページに戻る
    </Link>
  );
}

const linkStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: "24px",
  color: "#1976d2",
  fontSize: "14px",
};
