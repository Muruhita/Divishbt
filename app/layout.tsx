import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";

// Подключаем пиксельный шрифт с поддержкой кириллицы
const pixelFont = VT323({ 
  weight: "400", 
  subsets: ["latin", "cyrillic"],
  variable: "--font-pixel",
});

// Метаданные для вкладки браузера
export const metadata: Metadata = {
  title: "Сытый Лис | Архив Запретных Знаний",
  description: "Образовательный архив терминов, символов и комбинаций таверны 'Сытый Лис'",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      {/* Применяем шрифт ко всему body и задаем базовый цвет фона */}
      <body className={`${pixelFont.className} bg-[#1a1512] text-[#f4e4c1] antialiased`}>
        {children}
      </body>
    </html>
  );
}