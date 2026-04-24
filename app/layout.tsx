import type { Metadata } from "next";
import { Noto_Sans_JP, Zen_Old_Mincho } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const zenOldMincho = Zen_Old_Mincho({
  variable: "--font-zen-old-mincho",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "リアルタイムスライドショー",
  description: "リアルタイムで写真を表示するスライドショーアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${zenOldMincho.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
