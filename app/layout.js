export const metadata = { title: "Shehrat Admin", robots: "noindex", icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" } };
export default function RootLayout({ children }) {
  return (<html lang="en"><body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>{children}</body></html>);
}
