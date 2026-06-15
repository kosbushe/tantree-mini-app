import type { Metadata, Viewport } from "next";
import { Montserrat, Raleway } from "next/font/google";

import { TelegramWebAppScript } from "@/components/TelegramWebAppScript";

import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["100", "200", "300"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin", "cyrillic"],
  weight: ["200", "300"],
});

export const metadata: Metadata = {
  title: "TANTREE — Сила Присутствия",
  description: "72 карты урбан-тантры by Ksenia Bushe",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${montserrat.variable} ${raleway.variable} h-full bg-black antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#000000] text-zinc-100"
      >
        <TelegramWebAppScript />
        {children}
      </body>
    </html>
  );
}
