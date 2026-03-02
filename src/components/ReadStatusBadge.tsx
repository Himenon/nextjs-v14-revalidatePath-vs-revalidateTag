type Props = {
  isRead: boolean;
  testId?: string;
};

export function ReadStatusBadge({ isRead, testId }: Props) {
  return (
    <span
      data-testid={testId}
      style={{
        ...badgeStyle,
        backgroundColor: isRead ? "var(--color-badge-read-bg)" : "var(--color-badge-unread-bg)",
        color: isRead ? "var(--color-badge-read-text)" : "var(--color-badge-unread-text)",
      }}
    >
      {isRead ? "既読" : "未読"}
    </span>
  );
}

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};
