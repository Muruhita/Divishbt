import type { Metadata } from "next";
// Заменили VT323 на Pixelify_Sans
import { Pixelify_Sans } from "next/font/google";
import "./globals.css";

const pixelFont = Pixelify_Sans({ 
  weight: ["400", "700"], 
  subsets: ["latin", "cyrillic"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Сытый Лис | Архив",
  description: "Архив запретных знаний",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${pixelFont.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
