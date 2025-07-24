import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "授業実践紹介プラットフォーム | 学校に通えない子どもたちのための学習支援",
    template: "%s | 授業実践紹介プラットフォーム",
  },
  description: "学校に通えない小学生から中学生の子どもたちとその保護者が、適切な学習機会を見つけられるプラットフォーム。教育者による授業実践を詳しく紹介し、個別のニーズに応じた学習支援を提供します。",
  keywords: ["オンライン学習", "不登校支援", "授業実践", "個別指導", "小学生", "中学生", "学習支援"],
  authors: [{ name: "授業実践紹介プラットフォーム" }],
  creator: "授業実践紹介プラットフォーム",
  publisher: "授業実践紹介プラットフォーム",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "授業実践紹介プラットフォーム",
    description: "学校に通えない子どもたちのための学習支援プラットフォーム",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
    siteName: "授業実践紹介プラットフォーム",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "授業実践紹介プラットフォーム",
    description: "学校に通えない子どもたちのための学習支援プラットフォーム",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
