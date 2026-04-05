import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuaraWarga",
  description: "Sistem e-voting RT/RW berbasis Next.js monolith",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
