import Link from "next/link";
import { mainStyle } from "../styles/common";

const pages = [
  { href: "/notification", label: "通知一覧（revalidateTag）" },
  { href: "/notification-revalidate-path", label: "通知一覧（revalidatePath）" },
  { href: "/notification-no-revalidate", label: "通知一覧（キャッシュ無効化なし・失敗デモ）" },
  { href: "/embed/notification", label: "埋め込み通知一覧" },
];

export default function Home() {
  return (
    <main style={mainStyle}>
      <h1 style={{ marginBottom: "24px" }}>ページ一覧</h1>
      <ul style={listStyle}>
        {pages.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} style={linkStyle}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const linkStyle: React.CSSProperties = {
  color: "var(--color-primary)",
  textDecoration: "none",
  fontSize: "16px",
};
