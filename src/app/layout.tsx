import "./globals.css";
import { Providers } from "./providers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AegisMed - Hệ thống Quản lý Bệnh viện & Hội chẩn Emergent Authority",
  description: "Nền tảng Y tế Thông minh bảo vệ hồ sơ bệnh án và đơn thuốc bằng TideCloak và đồng thuận đa bên.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
