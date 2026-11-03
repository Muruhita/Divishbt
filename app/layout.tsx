// app/layout.tsx
import type { Metadata } from "next";
import localFont from 'next/font/local';
import { Inter, Pixelify_Sans } from "next/font/google";
import "./globals.css";

// Ваши существующие шрифты
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const pixel = Pixelify_Sans({ weight: ["400", "700"], subsets: ["latin", "cyrillic"], variable: "--font-pixel" });

// Подключение локального шрифта Pixeloid Mono
const pixeloidMono = localFont({
  src: './fonts/PixeloidMono.ttf', // Путь к файлу относительно layout.tsx
  variable: '--font-pixeloid-mono', // Имя CSS-переменной
});

export const metadata: Metadata = {
  title: "Сытый Лис | Архив",
  description: "Архив запретных знаний таверны 'Сытый Лис'",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      {/* Добавляем переменную нового шрифта в body */}
      <body className={`${inter.variable} ${pixel.variable} ${pixeloidMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
