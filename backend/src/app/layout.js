export const metadata = {
  title: "Ubuntu Backend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
