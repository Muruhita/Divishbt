import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const pixeloidMono = localFont({
  src: './fonts/PixeloidMono.ttf',
  variable: '--font-pixeloid-mono',
});

export const metadata: Metadata = {
  title: "Сытый Лис | Архив",
  description: "Архив запретных знаний таверны 'Сытый Лис'",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${pixeloidMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
