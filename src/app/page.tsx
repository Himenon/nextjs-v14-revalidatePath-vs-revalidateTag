import Link from "next/link";

const pages = [
  { href: "/notification", label: "通知一覧" },
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

const mainStyle: React.CSSProperties = {
  maxWidth: "720px",
  margin: "0 auto",
  padding: "32px 16px",
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const linkStyle: React.CSSProperties = {
  color: "#1976d2",
  textDecoration: "none",
  fontSize: "16px",
};
