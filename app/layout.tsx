import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Заменили пиксельный шрифт на современный и читаемый Inter
const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
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
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
