import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Onest } from "next/font/google";
import { OfflineKit } from "@/components/OfflineKit";
import { getLang } from "@/i18n/server";
import "./globals.css";

// Both families carry the full Kazakh alphabet (ә ғ қ ң ө ұ ү һ і) in their cyrillic-ext subset.
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Qonaq", template: "%s · Qonaq" },
  description: "Гостевые дома Казахстана на вашем языке. Kazakhstan guesthouses in your language. 用您的语言预订哈萨克斯坦民宿。",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#2b2824",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang === "zh" ? "zh-CN" : lang} className={`${onest.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <OfflineKit />
        {children}
      </body>
    </html>
  );
}
