import type { Metadata } from "next";
import { Mochiy_Pop_One, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import { CurtainIntro } from "@/components/motion/curtain-intro";
import { SITE } from "@/lib/constants";

const zenMaru = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mochiy = Mochiy_Pop_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ルナの公開家計簿",
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${zenMaru.variable} ${mochiy.variable} font-sans`}>
        <CurtainIntro />
        {children}
      </body>
    </html>
  );
}
