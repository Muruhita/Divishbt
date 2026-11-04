import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";

// Основной шрифт для текста
const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

// ВАШ ПИКСЕЛЬНЫЙ ШРИФТ
const pixeloidMono = localFont({
  src: './fonts/PixeloidMono.ttf', // Путь к файлу из скриншота
  variable: '--font-pixeloid-mono',
});

export const metadata: Metadata = {
  title: "Сытый Лис | Архив",
  description: "Архив запретных знаний таверны 'Сытый Лис'",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      {/* Добавляем переменные обоих шрифтов в body */}
      <body className={`${inter.variable} ${pixeloidMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
